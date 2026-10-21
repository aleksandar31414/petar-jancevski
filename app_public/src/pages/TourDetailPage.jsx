import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.service';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import Modal from '../components/Modal.jsx';
import ZoomGallery from '../components/ZoomGallery.jsx';
import CommentsSection from '../components/CommentsSection.jsx';
import { TourWeather } from '../components/Weather.jsx';
import { DifficultyBadge, ErrorAlert, Loader, useTitle } from '../components/ui.jsx';
import { datumSoDen, denari, tezina, dzvezdi } from '../pipes';

export default function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin } = useAuth();
  const [tour, setTour] = useState(null);
  const [error, setError] = useState(null);
  const [myReg, setMyReg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [transport, setTransport] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  useTitle(tour ? tour.title : 'Тура');

  const load = useCallback(async () => {
    setError(null);
    try {
      const t = await api.getTour(id);
      setTour(t);
      if (isLoggedIn) {
        const regs = await api.getMyRegistrations();
        setMyReg(regs.find((r) => r.tour._id === t._id) || null);
      }
    } catch (err) {
      setError(err);
    }
  }, [id, isLoggedIn]);
  useEffect(() => { load(); }, [load]);

  async function register() {
    setBusy(true);
    setActionError(null);
    try {
      const reg = await api.registerForTour(tour._id, { needsTransport: transport });
      setShowModal(false);
      setMessage(reg.status === 'potvrdena'
        ? 'Пријавата е потврдена! Испратена ви е е-пошта со детали.'
        : 'Турата е полна – ставени сте на листа на чекање. Ќе ве известиме ако се ослободи место.');
      await load();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    try {
      await api.cancelRegistration(myReg._id);
      setMessage('Пријавата е откажана.');
      setMyReg(null);
      await load();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="container mt-4">
        <ErrorAlert error={error} onRetry={error.status === 404 ? undefined : load} />
        <Link to="/ture">← Назад кон турите</Link>
      </div>
    );
  }
  if (!tour) return <Loader />;

  return (
    <>
      <PageHeader title={tour.title}
        subtitle={`${tour.location?.name} · ${datumSoDen(tour.date)} · ${tezina(tour.difficulty).toLowerCase()} тежина`}
        crumbs={[{ label: 'Тури', to: '/ture' }, { label: tour.title }]} />
      <div className="container">
        {message && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-1" />{message}
          <button type="button" className="btn-close" aria-label="Затвори" onClick={() => setMessage(null)} /></div>}
        <ErrorAlert error={actionError} />
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="panel mb-4">
              <div className={`tour-img ${tour.cover} rounded-3 mb-3`} style={{ height: 220 }}>
                <i className={`bi bi-${tour.icon}`} /><DifficultyBadge value={tour.difficulty} />
              </div>
              <h2 className="h5">За турата</h2>
              <p style={{ whiteSpace: 'pre-line' }}>{tour.description || 'Нема опис.'}</p>
              <div className="row text-center g-2 mb-3">
                {[['signpost', `${tour.lengthKm} км`, 'Должина'], ['graph-up-arrow', `+${tour.ascentM} м`, 'Искачување'],
                  ['clock', `${tour.durationH} ч`, 'Времетраење'], ['people', `${tour.registeredCount} / ${tour.capacity}`, 'Пријавени']].map(([icon, v, l]) => (
                  <div className="col-6 col-md-3" key={l}>
                    <div className="border rounded p-2"><i className={`bi bi-${icon} text-forest`} /><div className="fw-bold">{v}</div><small className="text-muted">{l}</small></div>
                  </div>
                ))}
              </div>
              <h3 className="h6">Галерија <small className="text-muted">(кликни за зумирање)</small></h3>
              <ZoomGallery images={tour.gallery} title={tour.title} />
            </div>
            <div className="panel">
              <CommentsSection tourId={tour._id} />
            </div>
          </div>

          <div className="col-lg-4">
            <div className="panel mb-4">
              <div className="d-flex justify-content-between"><span className="text-muted">Цена</span><strong>{denari(tour.price)}</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Средба</span><strong>{tour.meetTime}{tour.meetPlace ? `, ${tour.meetPlace}` : ''}</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Водич</span><strong>{tour.guide?.name}</strong></div>
              <div className="d-flex justify-content-between mb-3"><span className="text-muted">Оцена</span>
                <strong className="text-warning">{tour.avgRating ? `${dzvezdi(tour.avgRating)} (${tour.ratingCount})` : '–'}</strong></div>

              {tour.isPast && <div className="alert alert-secondary small py-2">Оваа тура е завршена.</div>}
              {!tour.isPast && !isLoggedIn && (
                <Link to="/najava" state={{ from: `/ture/${tour._id}` }} className="btn btn-warning w-100 mb-2">Најави се за да се пријавиш</Link>
              )}
              {!tour.isPast && isLoggedIn && !myReg && (
                <button type="button" className="btn btn-warning w-100 mb-2" onClick={() => setShowModal(true)}>
                  <i className="bi bi-check2-circle me-1" />{tour.isFull ? 'Пријави се на листа на чекање' : 'Пријави се на турата'}
                </button>
              )}
              {myReg && (
                <div className="alert alert-success small py-2 d-flex justify-content-between align-items-center">
                  <span>Твоја пријава: <strong>{myReg.statusLabel}</strong></span>
                  {!tour.isPast && <button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} onClick={cancel}>Откажи</button>}
                </div>
              )}
              {isAdmin && (
                <>
                  <Link to={`/ture/${tour._id}/uredi`} className="btn btn-outline-secondary btn-sm w-100 mb-1"><i className="bi bi-pencil me-1" />Уреди</Link>
                  <Link to={`/ture/${tour._id}/izbrishi`} className="btn btn-outline-danger btn-sm w-100"><i className="bi bi-trash me-1" />Избриши</Link>
                </>
              )}
            </div>
            <div className="panel mb-4">
              <h3 className="h6 text-forest"><i className="bi bi-cloud-sun me-1" />Прогноза за денот на турата (Open-Meteo)</h3>
              {tour.isPast ? <p className="small text-muted mb-0">Турата е завршена.</p> : <TourWeather location={tour.location} dateIso={tour.dateInput} />}
            </div>
            <div className="panel">
              <h3 className="h6">Задолжителна опрема</h3>
              {tour.equipment.length
                ? <ul className="small mb-0">{tour.equipment.map((e) => <li key={e._id}>{e.name}</li>)}</ul>
                : <p className="small text-muted mb-0">Нема посебни барања.</p>}
            </div>
          </div>
        </div>
        <button type="button" className="btn btn-link mt-3 px-0" onClick={() => navigate(-1)}>← Назад</button>
      </div>

      <Modal show={showModal} title="Потврди пријава" onClose={() => setShowModal(false)}
        footer={(
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Откажи</button>
            <button type="button" className="btn btn-forest" disabled={busy} onClick={register}>Потврди</button>
          </>
        )}>
        <p>Се пријавувате на <strong>{tour.title}</strong> ({datumSoDen(tour.date)}).</p>
        {tour.isFull && <div className="alert alert-warning small">Турата е полна – ќе бидете ставени на листа на чекање.</div>}
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="prevoz" checked={transport} onChange={(e) => setTransport(e.target.checked)} />
          <label className="form-check-label" htmlFor="prevoz">Ми треба организиран превоз</label>
        </div>
        <p className="small text-muted mt-2 mb-0"><i className="bi bi-envelope me-1" />Ќе добиете потврда на е-пошта.</p>
      </Modal>
    </>
  );
}
