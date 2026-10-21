import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.service';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import Modal from '../components/Modal.jsx';
import { TourWeather } from '../components/Weather.jsx';
import { ErrorAlert, Field, Loader, Timeline, useTitle } from '../components/ui.jsx';
import { validateProfile } from '../utils/validators';
import { datum, uloga } from '../pipes';
import { User } from '../models';

/** Лична листа за опрема со влечење и спуштање (HTML5 Drag and Drop). */
function EquipmentList({ initial, catalog }) {
  const [items, setItems] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState(null);
  const [overId, setOverId] = useState(null);
  const dragged = useRef(null);

  const move = (fromId, toId) => {
    if (fromId === toId) return;
    setItems((list) => {
      const next = [...list];
      const from = next.findIndex((i) => i._id === fromId);
      const to = next.findIndex((i) => i._id === toId);
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });
    setDirty(true);
  };
  const shift = (idx, dir) => {
    const target = items[idx + dir];
    if (target) move(items[idx]._id, target._id);
  };
  const add = (id) => {
    const eq = catalog.find((c) => c._id === id);
    if (eq && !items.some((i) => i._id === id)) { setItems([...items, eq]); setDirty(true); }
  };
  const remove = (id) => { setItems(items.filter((i) => i._id !== id)); setDirty(true); };

  async function save() {
    try {
      setItems(await api.saveMyEquipment(items.map((i) => i._id)));
      setDirty(false);
      setStatus({ type: 'success', text: 'Редоследот е зачуван.' });
    } catch (err) {
      setStatus({ type: 'danger', text: err.message });
    }
  }

  const free = catalog.filter((c) => !items.some((i) => i._id === c._id));

  return (
    <>
      <p className="small text-muted">Влечи и спушти (или користи ↑↓) за да го смениш редоследот на пакување.</p>
      {items.map((it, idx) => (
        <div key={it._id} draggable
          className={`drag-item d-flex align-items-center ${overId === it._id ? 'drag-over' : ''} ${dragged.current === it._id ? 'dragging' : ''}`}
          onDragStart={(e) => { dragged.current = it._id; e.dataTransfer.effectAllowed = 'move'; }}
          onDragOver={(e) => { e.preventDefault(); setOverId(it._id); }}
          onDragLeave={() => setOverId(null)}
          onDrop={(e) => { e.preventDefault(); move(dragged.current, it._id); setOverId(null); }}
          onDragEnd={() => { dragged.current = null; setOverId(null); }}>
          <i className="bi bi-grip-vertical me-2" />
          <span className="flex-grow-1">{idx + 1}. {it.name}</span>
          <button type="button" className="btn btn-sm btn-link p-0 px-1" onClick={() => shift(idx, -1)} aria-label="Нагоре"><i className="bi bi-arrow-up" /></button>
          <button type="button" className="btn btn-sm btn-link p-0 px-1" onClick={() => shift(idx, 1)} aria-label="Надолу"><i className="bi bi-arrow-down" /></button>
          <button type="button" className="btn btn-sm btn-link p-0 px-1 text-danger" onClick={() => remove(it._id)} aria-label="Отстрани"><i className="bi bi-x-lg" /></button>
        </div>
      ))}
      {!items.length && <p className="small text-muted">Листата е празна.</p>}
      {free.length > 0 && (
        <select className="form-select form-select-sm mt-2" value="" onChange={(e) => add(e.target.value)} aria-label="Додај опрема">
          <option value="">+ Додај опрема…</option>
          {free.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.categoryLabel})</option>)}
        </select>
      )}
      {status && <div className={`alert alert-${status.type} small py-1 mt-2 mb-0`}>{status.text}</div>}
      <button type="button" className="btn btn-sm btn-forest w-100 mt-2" disabled={!dirty} onClick={save}>Зачувај листа</button>
    </>
  );
}

function EditProfileModal({ user, show, onClose, onSaved }) {
  const { saveToken } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone, experience: user.experience, notifyNewTours: user.notifyNewTours, password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function save() {
    const errs = validateProfile(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      const { token } = await api.updateMe({ ...form, name: form.name.trim(), phone: form.phone.trim() });
      saveToken(token);
      onSaved();
    } catch (err) {
      setError(err);
      if (err.errors) setErrors(err.errors);
    }
  }

  return (
    <Modal show={show} title="Уреди профил" onClose={onClose}
      footer={<><button type="button" className="btn btn-secondary" onClick={onClose}>Откажи</button><button type="button" className="btn btn-forest" onClick={save}>Зачувај</button></>}>
      <ErrorAlert error={error} />
      <Field id="pn" label="Име и презиме" error={errors.name}><input id="pn" className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={form.name} onChange={set('name')} /></Field>
      <Field id="pp" label="Телефон" error={errors.phone}><input id="pp" className={`form-control ${errors.phone ? 'is-invalid' : ''}`} value={form.phone} onChange={set('phone')} /></Field>
      <Field id="px" label="Искуство" error={errors.experience}>
        <select id="px" className="form-select" value={form.experience} onChange={set('experience')}>
          {Object.entries(User.EXPERIENCE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </Field>
      <Field id="pl" label="Нова лозинка (опционално)" error={errors.password}><input id="pl" type="password" autoComplete="new-password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} value={form.password} onChange={set('password')} /></Field>
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" id="pnot" checked={form.notifyNewTours} onChange={set('notifyNewTours')} />
        <label className="form-check-label" htmlFor="pnot">Известувај ме по е-пошта за нови тури</label>
      </div>
    </Modal>
  );
}

export default function ProfilePage() {
  useTitle('Мој профил');
  const [user, setUser] = useState(null);
  const [regs, setRegs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [toCancel, setToCancel] = useState(null);

  const load = useCallback(() => {
    Promise.all([api.getMe(), api.getMyRegistrations(), api.getMyActivities(), api.getEquipment()])
      .then(([u, r, a, c]) => { setUser(u); setRegs(r); setActivities(a); setCatalog(c); })
      .catch(setError);
  }, []);
  useEffect(load, [load]);

  async function cancelReg() {
    try {
      await api.cancelRegistration(toCancel._id);
      setToCancel(null);
      load();
    } catch (err) {
      setError(err);
      setToCancel(null);
    }
  }

  if (error && !user) return <div className="container mt-4"><ErrorAlert error={error} onRetry={load} /></div>;
  if (!user) return <Loader />;
  const upcoming = regs.filter((r) => !r.tour.isPast);
  const past = regs.filter((r) => r.tour.isPast);

  return (
    <>
      <PageHeader title="Мој профил" subtitle={`${user.name} · ${uloga(user.role).toLowerCase()} од ${datum(user.createdAt)}`} crumbs={[{ label: 'Мој профил' }]} />
      <div className="container">
        <ErrorAlert error={error} />
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="panel text-center mb-4">
              <div className="avatar mx-auto mb-2" style={{ width: 72, height: 72, fontSize: '1.6rem' }}>{user.initials}</div>
              <h2 className="h5 mb-0">{user.name}</h2>
              <p className="small text-muted">{user.email} · {user.experienceLabel}</p>
              <div className="row g-2 small">
                <div className="col-4"><div className="fw-bold fs-5">{user.stats?.completed ?? 0}</div>тури</div>
                <div className="col-4"><div className="fw-bold fs-5">{user.stats?.km ?? 0}</div>км</div>
                <div className="col-4"><div className="fw-bold fs-5">{user.stats?.peaks ?? 0}</div>врвови</div>
              </div>
              <button type="button" className="btn btn-sm btn-outline-forest mt-3" onClick={() => setEditing(true)}><i className="bi bi-gear me-1" />Уреди профил</button>
            </div>
            <div className="panel">
              <h3 className="h6 mb-1"><i className="bi bi-backpack me-1" />Моја листа за опрема</h3>
              <EquipmentList initial={user.equipmentList} catalog={catalog} />
            </div>
          </div>
          <div className="col-lg-8">
            <div className="panel mb-4">
              <h3 className="h6">Мои наредни пријави</h3>
              {!upcoming.length && <p className="small text-muted mb-0">Немате пријави. <Link to="/ture">Најди тура →</Link></p>}
              {upcoming.length > 0 && (
                <div className="table-responsive">
                  <table className="table align-middle small mb-0">
                    <thead><tr><th>Тура</th><th>Датум</th><th>Статус</th><th>Прогноза</th><th /></tr></thead>
                    <tbody>
                      {upcoming.map((r) => (
                        <tr key={r._id}>
                          <td><Link to={`/ture/${r.tour._id}`}>{r.tour.title}</Link></td>
                          <td>{datum(r.tour.date)}</td>
                          <td><span className={`badge ${r.status === 'potvrdena' ? 'bg-success' : 'bg-warning text-dark'}`}>{r.statusLabel}</span></td>
                          <td><TourWeather location={r.tour.location} dateIso={r.tour.dateInput} compact /></td>
                          <td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setToCancel(r)}>Откажи</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {past.length > 0 && (
              <div className="panel mb-4">
                <h3 className="h6">Завршени тури</h3>
                <ul className="small mb-0">{past.map((r) => <li key={r._id}><Link to={`/ture/${r.tour._id}`}>{r.tour.title}</Link> – {datum(r.tour.date)}</li>)}</ul>
              </div>
            )}
            <div className="panel">
              <h3 className="h6">Историја на мои активности</h3>
              <Timeline items={activities.map((a) => ({ key: a._id, when: datum(a.createdAt), text: a.message }))} />
            </div>
          </div>
        </div>
      </div>
      {editing && <EditProfileModal user={user} show={editing} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load(); }} />}
      <Modal show={!!toCancel} title="Откажи пријава" onClose={() => setToCancel(null)}
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setToCancel(null)}>Не</button><button type="button" className="btn btn-danger" onClick={cancelReg}>Да, откажи</button></>}>
        Дали сигурно сакате да ја откажете пријавата за <strong>{toCancel?.tour.title}</strong>?
      </Modal>
    </>
  );
}
