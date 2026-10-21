import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.service';
import { COVERS, validateTour } from '../utils/validators';
import { Field, ErrorAlert, Loader } from './ui.jsx';
import { TEZINI } from '../pipes';

const EMPTY = {
  title: '', location: '', guide: '', difficulty: 'sredna', date: '', meetTime: '07:00', meetPlace: '',
  lengthKm: '', ascentM: '', durationH: '', capacity: '', price: '0', description: '', equipment: [], cover: 'g1', gallery: [], notify: true,
};

function fromTour(t) {
  return {
    title: t.title,
    location: t.location?._id || '',
    guide: t.guide?._id || '',
    difficulty: t.difficulty,
    date: t.dateInput,
    meetTime: t.meetTime,
    meetPlace: t.meetPlace,
    lengthKm: String(t.lengthKm),
    ascentM: String(t.ascentM),
    durationH: String(t.durationH),
    capacity: String(t.capacity),
    price: String(t.price),
    description: t.description,
    equipment: t.equipment.map((e) => e._id || e),
    cover: t.cover,
    gallery: t.gallery,
    notify: true,
  };
}

/**
 * Форма за тура – иста компонента за додавање и уредување (се прилагодува според податоците).
 * @param {{tour?: import('../models').Tour, submitLabel:string, onSubmit:(data:object)=>Promise<void>, serverErrors?:object}} props
 */
export default function TourForm({ tour, submitLabel, onSubmit, cancelTo }) {
  const isNew = !tour;
  const [form, setForm] = useState(() => (tour ? fromTour(tour) : EMPTY));
  const [errors, setErrors] = useState({});
  const [lists, setLists] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    Promise.all([api.getLocations(), api.getGuides(), api.getEquipment()])
      .then(([locations, guides, equipment]) => setLists({ locations, guides, equipment }))
      .catch(setLoadError);
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const toggleIn = (field, value) => setForm((f) => ({
    ...f,
    [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
  }));
  const cls = (field, base = 'form-control') => `${base} ${errors[field] ? 'is-invalid' : ''}`;

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateTour(form, { isNew });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    setSubmitError(null);
    try {
      const data = {
        ...form,
        title: form.title.trim(),
        guide: form.guide || undefined,
        lengthKm: Number(form.lengthKm),
        ascentM: Number(form.ascentM),
        durationH: Number(form.durationH),
        capacity: Number(form.capacity),
        price: Number(form.price),
      };
      await onSubmit(data);
    } catch (err) {
      setSubmitError(err);
      if (err.errors) setErrors(err.errors);
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return <ErrorAlert error={loadError} />;
  if (!lists) return <Loader />;

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <ErrorAlert error={submitError} />
      <div className="row g-3">
        <Field id="title" label="Назив на турата *" error={errors.title} className="col-md-8">
          <input id="title" className={cls('title')} value={form.title} onChange={set('title')} maxLength={80} />
        </Field>
        <Field id="difficulty" label="Тежина *" error={errors.difficulty} className="col-md-4">
          <select id="difficulty" className={cls('difficulty', 'form-select')} value={form.difficulty} onChange={set('difficulty')}>
            {Object.entries(TEZINI).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field id="location" label="Врв / локација *" error={errors.location} hint="Координатите на врвот се користат за прогнозата од Open-Meteo." className="col-md-6">
          <select id="location" className={cls('location', 'form-select')} value={form.location} onChange={set('location')}>
            <option value="">– изберете врв –</option>
            {lists.locations.map((l) => <option key={l._id} value={l._id}>{l.label} · {l.region}</option>)}
          </select>
        </Field>
        <Field id="date" label="Датум *" error={errors.date} className="col-6 col-md-3">
          <input id="date" type="date" className={cls('date')} value={form.date} onChange={set('date')} />
        </Field>
        <Field id="meetTime" label="Час на средба *" error={errors.meetTime} className="col-6 col-md-3">
          <input id="meetTime" type="time" className={cls('meetTime')} value={form.meetTime} onChange={set('meetTime')} />
        </Field>
        <Field id="meetPlace" label="Место на средба" error={errors.meetPlace} className="col-md-6">
          <input id="meetPlace" className={cls('meetPlace')} value={form.meetPlace} onChange={set('meetPlace')} maxLength={80} />
        </Field>
        <Field id="guide" label="Водич" error={errors.guide} hint="Ако не изберете, водич сте вие." className="col-md-6">
          <select id="guide" className={cls('guide', 'form-select')} value={form.guide} onChange={set('guide')}>
            <option value="">– јас –</option>
            {lists.guides.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
        </Field>
        <Field id="lengthKm" label="Должина (км) *" error={errors.lengthKm} className="col-6 col-md-3">
          <input id="lengthKm" type="number" min={1} max={60} step={0.5} className={cls('lengthKm')} value={form.lengthKm} onChange={set('lengthKm')} />
        </Field>
        <Field id="ascentM" label="Искачување (м) *" error={errors.ascentM} className="col-6 col-md-3">
          <input id="ascentM" type="number" min={0} max={3000} className={cls('ascentM')} value={form.ascentM} onChange={set('ascentM')} />
        </Field>
        <Field id="durationH" label="Времетраење (ч) *" error={errors.durationH} className="col-6 col-md-3">
          <input id="durationH" type="number" min={1} max={24} step={0.5} className={cls('durationH')} value={form.durationH} onChange={set('durationH')} />
        </Field>
        <Field id="capacity" label="Макс. учесници *" error={errors.capacity} className="col-6 col-md-3">
          <input id="capacity" type="number" min={2} max={60} className={cls('capacity')} value={form.capacity} onChange={set('capacity')} />
        </Field>
        <Field id="price" label="Цена (ден.) *" error={errors.price} className="col-md-4">
          <input id="price" type="number" min={0} max={20000} step={50} className={cls('price')} value={form.price} onChange={set('price')} />
        </Field>
        <div className="col-md-8">
          <span className="form-label d-block">Насловна слика *</span>
          <div className="d-flex flex-wrap gap-2">
            {COVERS.map((c) => (
              <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, cover: c }))}
                className={`gallery-thumb ${c}`} style={{ width: 56, height: 40, outline: form.cover === c ? '3px solid #e8a33d' : 'none' }}
                aria-label={`Насловна ${c}`} aria-pressed={form.cover === c} />
            ))}
          </div>
          <div className="form-text">Галерија (кликни за додавање/отстранување):</div>
          <div className="d-flex flex-wrap gap-2">
            {COVERS.map((c) => (
              <button key={c} type="button" onClick={() => toggleIn('gallery', c)}
                className={`gallery-thumb ${c}`} style={{ width: 40, height: 28, opacity: form.gallery.includes(c) ? 1 : 0.3 }}
                aria-label={`Галерија ${c}`} aria-pressed={form.gallery.includes(c)} />
            ))}
          </div>
        </div>
        <Field id="description" label={`Опис (${form.description.length}/1500)`} error={errors.description} className="col-12">
          <textarea id="description" rows={4} className={cls('description')} value={form.description} onChange={set('description')} maxLength={1500} />
        </Field>
        <div className="col-12">
          <span className="form-label d-block">Задолжителна опрема</span>
          <div className="d-flex flex-wrap gap-3">
            {lists.equipment.map((e) => (
              <div className="form-check" key={e._id}>
                <input className="form-check-input" type="checkbox" id={`eq-${e._id}`} checked={form.equipment.includes(e._id)} onChange={() => toggleIn('equipment', e._id)} />
                <label className="form-check-label" htmlFor={`eq-${e._id}`} title={e.categoryLabel}>{e.name}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="col-12">
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="notify" checked={form.notify} onChange={set('notify')} />
            <label className="form-check-label" htmlFor="notify">
              {isNew ? 'Испрати е-пошта до претплатените корисници за новата тура' : 'Испрати е-пошта до пријавените за промените'}
            </label>
          </div>
        </div>
      </div>
      <hr />
      <div className="d-flex justify-content-end gap-2">
        <Link to={cancelTo} className="btn btn-outline-secondary">Откажи</Link>
        <button type="submit" className="btn btn-forest" disabled={saving}>
          {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-check-lg me-1" />}{submitLabel}
        </button>
      </div>
    </form>
  );
}
