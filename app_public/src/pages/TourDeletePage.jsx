import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.service';
import { PageHeader } from '../components/Layout.jsx';
import Modal from '../components/Modal.jsx';
import { DifficultyBadge, ErrorAlert, Field, Loader, useTitle } from '../components/ui.jsx';
import { DELETE_REASONS } from '../utils/validators';
import { datum } from '../pipes';

const CONFIRM_WORD = 'ИЗБРИШИ';

export default function TourDeletePage() {
  useTitle('Избриши тура');
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [comments, setComments] = useState(0);
  const [error, setError] = useState(null);
  const [reason, setReason] = useState('vreme');
  const [message, setMessage] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    Promise.all([api.getTour(id), api.getComments(id)])
      .then(([t, c]) => { setTour(t); setComments(c.length); })
      .catch(setError);
  }, [id]);

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await api.deleteTour(id, { reason, message: message.trim() });
      setDone(true);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  if (!tour && !error) return <Loader />;
  if (!tour) return <div className="container mt-4"><ErrorAlert error={error} /></div>;
  const regCount = tour.registeredCount + tour.waitingCount;

  return (
    <>
      <PageHeader title="Бришење тура" subtitle="Потврда пред трајно бришење" crumbs={[{ label: 'Тури', to: '/ture' }, { label: tour.title, to: `/ture/${id}` }, { label: 'Избриши' }]} />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="panel border border-danger">
              <ErrorAlert error={error} />
              <div className="text-center mb-3">
                <i className="bi bi-exclamation-octagon text-danger" style={{ fontSize: '3rem' }} />
                <h2 className="h4 mt-2">Дали сте сигурни дека сакате да ја избришете турата?</h2>
              </div>
              <div className="d-flex gap-3 align-items-center border rounded p-3 mb-3">
                <div className={`tour-img ${tour.cover} rounded`} style={{ height: 70, width: 90, fontSize: '1.6rem' }}><i className={`bi bi-${tour.icon}`} /></div>
                <div>
                  <strong>{tour.title}</strong>
                  <div className="small text-muted">{tour.location?.name} · {datum(tour.date)} · <DifficultyBadge value={tour.difficulty} /></div>
                </div>
              </div>
              <div className="alert alert-warning small">
                <strong>Со бришењето ќе се отстранат и:</strong>
                <ul className="mb-0">
                  <li>{regCount} пријави на учесници (колекција Пријави)</li>
                  <li>{comments} коментари и оцени (колекција Коментари)</li>
                </ul>
              </div>
              <Field id="reason" label="Причина (се праќа до пријавените по е-пошта)">
                <select id="reason" className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                  {Object.entries(DELETE_REASONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field id="msg" label={`Порака (${message.length}/500)`}>
                <textarea id="msg" className="form-control" rows={2} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Пр. Поради најавеното невреме турата се откажува." />
              </Field>
              <Field id="confirm" label={<>За потврда внесете <code>{CONFIRM_WORD}</code></>}>
                <input id="confirm" className="form-control" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
              </Field>
              <div className="d-flex justify-content-end gap-2">
                <Link to={`/ture/${id}`} className="btn btn-outline-secondary">Откажи</Link>
                <button type="button" className="btn btn-danger" disabled={confirm.trim().toUpperCase() !== CONFIRM_WORD || busy} onClick={remove}>
                  <i className="bi bi-trash me-1" />Избриши трајно
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal show={done} title="Турата е избришана" onClose={() => navigate('/ture')}
        footer={<button type="button" className="btn btn-forest" onClick={() => navigate('/ture')}>Назад кон турите</button>}>
        <div className="text-center">
          <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }} />
          <p className="mt-2 mb-0">{regCount ? `Испратени се ${regCount} известувања по е-пошта.` : 'Немаше пријавени учесници.'}</p>
        </div>
      </Modal>
    </>
  );
}
