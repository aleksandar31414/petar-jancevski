import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.service';
import { assess } from '../services/weather.service';
import { PageHeader } from '../components/Layout.jsx';
import { useForecast, WeatherDay } from '../components/Weather.jsx';
import { ErrorAlert, Loader, useTitle } from '../components/ui.jsx';
import { datum, stepeni, vreme } from '../pipes';

const time = (iso) => (iso ? iso.slice(11, 16) : '–');

/** Интеграција со надворешен извор: Open-Meteo. */
export default function WeatherPage() {
  useTitle('Прогноза');
  const [params, setParams] = useSearchParams();
  const [locations, setLocations] = useState(null);
  const [tours, setTours] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getLocations(), api.getTours({ limit: 50 })])
      .then(([l, t]) => { setLocations(l); setTours(t.items); })
      .catch(setError);
  }, []);

  const selectedId = params.get('vrv') || locations?.[0]?._id;
  const location = locations?.find((l) => l._id === selectedId) || null;
  const { data, error: wError, loading } = useForecast(location);
  const locTours = tours.filter((t) => t.location?._id === selectedId);

  if (error) return <div className="container mt-4"><ErrorAlert error={error} /></div>;
  if (!locations) return <Loader />;
  if (!locations.length) return <div className="container mt-4"><p>Нема внесени врвови. Отворете <Link to="/db">/db</Link>.</p></div>;

  const w = data ? vreme(data.current.code) : null;
  const today = data?.days[0];

  return (
    <>
      <PageHeader title="Временска прогноза за врвовите" subtitle="Интеграција со надворешен извор: Open-Meteo API" crumbs={[{ label: 'Прогноза' }]} />
      <div className="container">
        <div className="panel mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <label className="form-label small" htmlFor="vrv">Врв</label>
              <select id="vrv" className="form-select" value={selectedId} onChange={(e) => setParams({ vrv: e.target.value })}>
                {locations.map((l) => <option key={l._id} value={l._id}>{l.label} – {l.region} ({l.lat.toFixed(2)}°N, {l.lon.toFixed(2)}°E)</option>)}
              </select>
            </div>
            <div className="col-md-4 small text-muted">Прогнозата се пресметува за надморската височина на врвот.</div>
          </div>
        </div>

        {loading && <Loader text="Ја преземам прогнозата од Open-Meteo…" />}
        <ErrorAlert error={wError} />
        {data && (
          <>
            <div className="row g-4 mb-4">
              <div className="col-lg-5">
                <div className="panel h-100">
                  <div className="text-muted small">Сега на {location.name} · ажурирано {time(data.current.time)}</div>
                  <div className="d-flex align-items-center gap-3 my-2">
                    <i className={`bi bi-${w.icon}`} style={{ fontSize: '4rem' }} />
                    <div><div className="display-5 fw-bold">{stepeni(data.current.temperature)}</div><div>{w.text}</div></div>
                  </div>
                  <div className="row small g-2">
                    <div className="col-6"><i className="bi bi-wind me-1" />Ветер: {Math.round(data.current.wind)} км/ч</div>
                    <div className="col-6"><i className="bi bi-thermometer me-1" />Чувство: {stepeni(data.current.feelsLike)}</div>
                    <div className="col-6"><i className="bi bi-moisture me-1" />Влажност: {data.current.humidity}%</div>
                    <div className="col-6"><i className="bi bi-sunrise me-1" />Изгрев: {time(today?.sunrise)}</div>
                    <div className="col-6"><i className="bi bi-droplet me-1" />Врнежи денес: {today?.precipitation}%</div>
                    <div className="col-6"><i className="bi bi-sunset me-1" />Зајдисонце: {time(today?.sunset)}</div>
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="panel h-100">
                  <h2 className="h6">Проценка за турите на овој врв</h2>
                  {!locTours.length && <p className="small text-muted mb-0">Нема закажани тури на {location.name}.</p>}
                  {locTours.map((t) => {
                    const a = assess(data.forDate(t.dateInput));
                    return (
                      <div key={t._id} className={`alert alert-${a ? a.level : 'secondary'} py-2 small`}>
                        <Link to={`/ture/${t._id}`} className="fw-semibold">{t.title}</Link> ({datum(t.date)}) – {a ? a.text : 'прогнозата е достапна најмногу 16 дена однапред.'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <h2 className="h5 mb-3">Прогноза за 7 дена</h2>
            <div className="week-grid mb-4">
              {data.days.slice(0, 7).map((d) => (
                <WeatherDay key={d.date} day={d} highlight={locTours.some((t) => t.dateInput === d.date)} />
              ))}
            </div>
          </>
        )}
        <div className="panel">
          <h2 className="h6"><i className="bi bi-plug me-1" />Како работи интеграцијата</h2>
          <p className="small mb-0">Апликацијата ги чува само координатите и височината на врвовите (колекција Врвови). Прогнозата се презема во живо од бесплатниот
            {' '}<a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo API</a> – податоци кои базата на проектот не ги содржи.
            Деновите со закажана тура се означени со жолта рамка.</p>
        </div>
      </div>
    </>
  );
}
