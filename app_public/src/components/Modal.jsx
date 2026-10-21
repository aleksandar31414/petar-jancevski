import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal popup компонента (Bootstrap стил). Сите popup прозорци во апликацијата ја користат неа.
 * @param {{show:boolean, title:string, onClose:Function, footer?:React.ReactNode, size?:'sm'|'lg'|'xl', children:React.ReactNode}} props
 */
export default function Modal({ show, title, onClose, footer, size, children }) {
  useEffect(() => {
    if (!show) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [show, onClose]);

  if (!show) return null;
  return createPortal(
    <>
      <div className="modal-backdrop-custom" onClick={onClose} />
      <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
        <div className={`modal-dialog modal-dialog-centered ${size ? `modal-${size}` : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Затвори" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
