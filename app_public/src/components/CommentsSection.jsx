import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.service';
import { useAuth } from '../context/AuthContext.jsx';
import { validateComment } from '../utils/validators';
import { dzvezdi, relativnoVreme } from '../pipes';
import { ErrorAlert, Loader, StarInput } from './ui.jsx';
import Modal from './Modal.jsx';

function CommentForm({ tourId, parent, onDone, onCancel }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const errs = validateComment({ text, rating }, { isReply: !!parent });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await api.addComment(tourId, { text: text.trim(), rating: parent ? null : rating || null, parent: parent || undefined });
      setText('');
      setRating(0);
      setError(null);
      onDone();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className={parent ? 'ms-5 mb-3' : ''}>
      <ErrorAlert error={error} />
      <label className="form-label small" htmlFor={`kom-${parent || 'nov'}`}>{parent ? 'Твој одговор' : 'Твој коментар'} ({text.length}/500)</label>
      <textarea id={`kom-${parent || 'nov'}`} className={`form-control mb-2 ${errors.text ? 'is-invalid' : ''}`} rows={2} maxLength={500}
        value={text} onChange={(e) => setText(e.target.value)} placeholder="Напиши коментар..." />
      {errors.text && <div className="invalid-feedback d-block mb-2">{errors.text}</div>}
      <div className="d-flex justify-content-between align-items-center">
        {parent ? <span /> : <StarInput value={rating} onChange={setRating} />}
        <div className="d-flex gap-2">
          {onCancel && <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCancel}>Откажи</button>}
          <button type="submit" className="btn btn-sm btn-forest" disabled={saving}>Објави</button>
        </div>
      </div>
    </form>
  );
}

/** Интеракција помеѓу корисниците: коментари, одговори и оцени. */
export default function CommentsSection({ tourId }) {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const [comments, setComments] = useState(null);
  const [error, setError] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(() => {
    api.getComments(tourId).then(setComments).catch(setError);
  }, [tourId]);
  useEffect(load, [load]);

  async function confirmDelete() {
    try {
      await api.deleteComment(toDelete._id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err);
      setToDelete(null);
    }
  }

  if (error && !comments) return <ErrorAlert error={error} onRetry={load} />;
  if (!comments) return <Loader />;
  const roots = comments.filter((c) => !c.parent);
  const replies = (id) => comments.filter((c) => c.parent === id);

  const renderComment = (c, isReply) => (
    <div className={`d-flex gap-3 mb-3 ${isReply ? 'ms-5' : ''}`} key={c._id}>
      <div className={`avatar ${c.user.isAdmin ? 'bg-warning text-dark' : ''}`}>{c.user.initials}</div>
      <div className="flex-grow-1">
        <div>
          <strong>{c.user.name}</strong>{' '}
          {c.user.isAdmin && <span className="badge bg-warning text-dark">Водич</span>}{' '}
          {c.rating && <span className="text-warning">{dzvezdi(c.rating)}</span>}{' '}
          <small className="text-muted">{relativnoVreme(c.createdAt)}</small>
        </div>
        <p className="mb-1" style={{ whiteSpace: 'pre-line' }}>{c.text}</p>
        <div className="d-flex gap-3 small">
          {isLoggedIn && !isReply && <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setReplyTo(c._id)}>Одговори</button>}
          {(isAdmin || (user && c.user._id === user._id)) && (
            <button type="button" className="btn btn-link btn-sm p-0 text-danger" onClick={() => setToDelete(c)}>Избриши</button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <h2 className="h5 mb-3"><i className="bi bi-chat-dots me-1" />Коментари и оцени ({comments.length})</h2>
      <ErrorAlert error={error} />
      {!roots.length && <p className="text-muted small">Сè уште нема коментари. Биди прв!</p>}
      {roots.map((c) => (
        <div key={c._id}>
          {renderComment(c, false)}
          {replies(c._id).map((r) => renderComment(r, true))}
          {replyTo === c._id && <CommentForm tourId={tourId} parent={c._id} onDone={() => { setReplyTo(null); load(); }} onCancel={() => setReplyTo(null)} />}
        </div>
      ))}
      <hr />
      {isLoggedIn
        ? <CommentForm tourId={tourId} onDone={load} />
        : <p className="small mb-0"><Link to="/najava">Најави се</Link> за да коментираш и оцениш.</p>}

      <Modal show={!!toDelete} title="Бришење коментар" onClose={() => setToDelete(null)}
        footer={(
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setToDelete(null)}>Откажи</button>
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Избриши</button>
          </>
        )}>
        Дали сигурно сакате да го избришете коментарот{toDelete && replies(toDelete._id).length ? ' и одговорите на него' : ''}?
      </Modal>
    </>
  );
}
