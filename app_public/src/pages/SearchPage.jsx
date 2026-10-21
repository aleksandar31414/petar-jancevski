import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.service';
import { getForecast, assess } from '../services/weather.service';
import { PageHeader } from '../components/Layout.jsx';
import TourCard from '../components/TourCard.jsx';
import { ErrorAlert, Loader, Pagination, useTitle } from '../components/ui.jsx';
import { REGIONS, RE } from '../utils/validators';
import { TEZINI, datum } from '../pipes';

const DEFAULTS = { q: '', difficulty: [], region: '', from: '', to: '', maxLength: '30', available: false, goodWeather: false };

function readParams(params) {
  return {
    q: params.get('q') || '',
    difficulty: (params.get('difficulty') || '').split(',').filter((d) => TEZINI[d]),
    region: REGIONS.includes(params.get('region')) ? params.get('region') : '',
    from: params.get('from') || '',
    to: params.get('to') || '',
    maxLength: params.get('maxLength') || '30',
    available: params.get('available') === 'true',
    goodWeather: params.get('goodWeather') === 'true',
  };
}

/** Пребарување со напредни филтри; филтрите се чуваат во URL. */
export default function SearchPage() {
  useTitle('Пребарување');
  const [params, setParams] = useSearchParams();
  const applied = readParams(params);
  const [form, setForm] = useState(applied);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const page = Number(params.get('page')) || 1;
  const key = params.toString();

  useEffect(() => {
    const a = readParams(params);
    setForm(a);
    setResult(null);
    setError(null);
    (async () => {
      const data = await api.getTours({
        q: a.q, difficulty: a.difficulty.join(','), region: a.region, from: a.from, to: a.to,
        maxLength: a.maxLength !== '30' ? a.maxLength : '', available: a.available ? 'true' : '', limit: a.goodWeather ? 50 : 9, page: a.goodWeather ? 1 : page,
      });
      if (a.goodWeather) {
        // Филтер според прогнозата од Open-Meteo (само тури во наредните 16 дена)
        const checks = await Promise.all(data.items.map(async (t) => {
          try {
            const f = await getForecast(t.location);
            const ass = assess(f.forDate(t.dateInput));
            return ass && ass.level === 'success';
          } catch { return false; }
        }));
        const items = data.items.filter((_, i) => checks[i]);
        return { items, total: items.length, page: 1, pages: 1 };
      }
      return data;
    })().then(setResult).catch(setError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!RE.search.test(form.q)) errs.q = 'Само букви, бројки и интерпункција (до 50 знаци).';
    if (form.from && form.to && form.from > form.to) errs.to = 'Крајниот датум е пред почетниот.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const next = new URLSearchParams();
    if (form.q.trim()) next.set('q', form.q.trim());
    if (form.difficulty.length) next.set('difficulty', form.difficulty.join(','));
    ['region', 'from', 'to'].forEach((k) => form[k] && next.set(k, form[k]));
    if (form.maxLength !== '30') next.set('maxLength', form.maxLength);
    if (form.available) next.set('available', 'true');
    if (form.goodWeather) next.set('goodWeather', 'true');
    setParams(next);
  }

  const toggleDiff = (d) => setForm((f) => ({ ...f, difficulty: f.difficulty.includes(d) ? f.difficulty.filter((x) => x !== d) : [...f.difficulty, d] }));
  const removeFilter = (k) => {
    const next = new URLSearchParams(params);
    next.delete(k);
    if (k === 'from') next.delete('to');
    next.delete('page');
    setParams(next);
  };

  const chips = [
    applied.q && ['q', `„${applied.q}“`],
    applied.difficulty.length && ['difficulty', applied.difficulty.map((d) => TEZINI[d]).join(', ')],
    applied.region && ['region', applied.region],
    (applied.from || applied.to) && ['from', `${applied.from ? datum(applied.from) : '…'} – ${applied.to ? datum(applied.to) : '…'}`],
    applied.maxLength !== '30' && ['maxLength', `до ${applied.maxLength} км`],
    applied.available && ['available', 'слободни места'],
    applied.goodWeather && ['goodWeather', 'поволна прогноза'],
  ].filter(Boolean);

  return (
    <>
      <PageHeader title="Пребарување тури" subtitle="Најди тура по клучен збор, тежина, датум, регион и прогноза" crumbs={[{ label: 'Пребарување' }]} />
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-3">
            <form className="panel" onSubmit={submit} noValidate>
              <h2 className="h6 mb-3"><i className="bi bi-funnel me-1" />Филтри</h2>
              <label className="form-label small" htmlFor="q">Клучен збор</label>
              <input id="q" className={`form-control form-control-sm mb-1 ${errors.q ? 'is-invalid' : ''}`} value={form.q} maxLength={50}
                onChange={(e) => setForm({ ...form, q: e.target.value })} list="predlozi" placeholder="пр. езеро, Кораб" />
              <datalist id="predlozi"><option value="езеро" /><option value="Пелистер" /><option value="Кораб" /><option value="Матка" /></datalist>
              {errors.q && <div className="invalid-feedback d-block">{errors.q}</div>}
              <span className="form-label small d-block mt-3">Тежина</span>
              {Object.entries(TEZINI).map(([k, v]) => (
                <div className="form-check" key={k}>
                  <input className="form-check-input" type="checkbox" id={`f-${k}`} checked={form.difficulty.includes(k)} onChange={() => toggleDiff(k)} />
                  <label className="form-check-label small" htmlFor={`f-${k}`}>{v}</label>
                </div>
              ))}
              <label className="form-label small mt-3" htmlFor="reg">Регион</label>
              <select id="reg" className="form-select form-select-sm mb-3" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                <option value="">Сите региони</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <span className="form-label small d-block">Датум од – до</span>
              <input type="date" className="form-control form-control-sm mb-1" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} aria-label="Од" />
              <input type="date" className={`form-control form-control-sm ${errors.to ? 'is-invalid' : ''}`} value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} aria-label="До" />
              {errors.to && <div className="invalid-feedback d-block">{errors.to}</div>}
              <label className="form-label small mt-3" htmlFor="rng">Макс. должина: <strong>{form.maxLength === '30' ? 'без ограничување' : `${form.maxLength} км`}</strong></label>
              <input type="range" id="rng" className="form-range mb-3" min={2} max={30} value={form.maxLength} onChange={(e) => setForm({ ...form, maxLength: e.target.value })} />
              <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" id="slob" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
                <label className="form-check-label small" htmlFor="slob">Само со слободни места</label>
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="vreme" checked={form.goodWeather} onChange={(e) => setForm({ ...form, goodWeather: e.target.checked })} />
                <label className="form-check-label small" htmlFor="vreme">Само со поволна прогноза</label>
              </div>
              <button type="submit" className="btn btn-forest btn-sm w-100">Пребарај</button>
              <button type="button" className="btn btn-link btn-sm w-100" onClick={() => { setForm(DEFAULTS); setParams({}); }}>Исчисти</button>
            </form>
          </div>
          <div className="col-lg-9">
            <ErrorAlert error={error} />
            {!result && !error && <Loader text="Пребарувам…" />}
            {result && (
              <>
                <p className="text-muted small">
                  Пронајдени <strong>{result.total}</strong> тури
                  {chips.map(([k, label]) => (
                    <button type="button" key={k} className="badge bg-light text-dark border ms-1" onClick={() => removeFilter(k)}
                      aria-label={`Отстрани филтер ${label}`}>{label} ✕</button>
                  ))}
                </p>
                <div className="row g-4">{result.items.map((t) => <TourCard key={t._id} tour={t} />)}</div>
                {!result.items.length && <p className="text-muted mt-3"><i className="bi bi-lightbulb me-1" />Нема тури што одговараат. Обидете се со помалку филтри.</p>}
                <Pagination page={result.page} pages={result.pages} onChange={(p) => { const n = new URLSearchParams(params); n.set('page', p); setParams(n); }} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
