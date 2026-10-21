// Мали повторно употребливи компоненти.
import { useEffect } from 'react';
import { tezina } from '../pipes';

export function Loader({ text = 'Се вчитува…' }) {
  return (
    <div className="loader">
      <div className="text-center text-muted">
        <div className="spinner-border text-success mb-2" role="status" />
        <div className="small">{text}</div>
      </div>
    </div>
  );
}

export function ErrorAlert({ error, onRetry }) {
  if (!error) return null;
  const message = typeof error === 'string' ? error : error.message;
  return (
    <div className="alert alert-danger d-flex justify-content-between align-items-center gap-2" role="alert">
      <span><i className="bi bi-exclamation-triangle me-1" />{message}</span>
      {onRetry && <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>Обиди се повторно</button>}
    </div>
  );
}

export function DifficultyBadge({ value, className = '' }) {
  return <span className={`badge diff-${value} ${className}`}>{tezina(value)}</span>;
}

export function StatCard({ value, label, accent }) {
  return (
    <div className="stat" style={accent ? { borderColor: accent } : undefined}>
      <div className="num">{value ?? '–'}</div>
      <div className="small text-muted">{label}</div>
    </div>
  );
}

/** Поле во форма со лабела и порака за грешка. */
export function Field({ id, label, error, hint, children, className = 'mb-3' }) {
  return (
    <div className={className}>
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      {children}
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {!error && hint && <div className="form-text">{hint}</div>}
    </div>
  );
}

export function Timeline({ items, empty = 'Нема активности.' }) {
  if (!items.length) return <p className="small text-muted mb-0">{empty}</p>;
  return (
    <ul className="timeline small">
      {items.map((a) => (
        <li key={a.key}>
          <strong>{a.when}</strong> – {a.text}
        </li>
      ))}
    </ul>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-4" aria-label="Страници">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onChange(page - 1)} aria-label="Претходна">‹</button>
        </li>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
            <button type="button" className="page-link" onClick={() => onChange(p)}>{p}</button>
          </li>
        ))}
        <li className={`page-item ${page >= pages ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onChange(page + 1)} aria-label="Следна">›</button>
        </li>
      </ul>
    </nav>
  );
}

/** Избор на оцена со ѕвезди. */
export function StarInput({ value, onChange }) {
  return (
    <span className="stars" role="radiogroup" aria-label="Оцена">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" className={n <= value ? 'on' : ''} onClick={() => onChange(n === value ? 0 : n)}
          aria-label={`${n} ѕвезди`} aria-checked={n === value} role="radio">★</button>
      ))}
    </span>
  );
}

/** Го поставува насловот на табот во прелистувачот. */
export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} – ВрвТура` : 'ВрвТура';
  }, [title]);
}
