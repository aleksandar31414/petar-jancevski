import { useState } from 'react';
import Modal from './Modal.jsx';
import { PeakScene } from './Scenery.jsx';

const ICONS = { g1: 'water', g2: 'tree', g3: 'triangle', g4: 'snow', g5: 'droplet', g6: 'sun' };

/** Галерија со компонента за зумирање (копчиња +/−, тркалце на глувчето, двоен клик). */
export default function ZoomGallery({ images, title }) {
  const [open, setOpen] = useState(null);
  const [zoom, setZoom] = useState(1);
  const clamp = (z) => Math.min(4, Math.max(1, Math.round(z * 4) / 4));

  const show = (img) => { setOpen(img); setZoom(1); };
  if (!images.length) return <p className="small text-muted">Нема слики за оваа тура.</p>;

  return (
    <>
      <div className="row g-2">
        {images.map((img, i) => (
          <div className="col-3" key={`${img}-${i}`}>
            <button type="button" className={`gallery-thumb ${img}`} onClick={() => show(img)} aria-label={`Слика ${i + 1} – зумирај`}>
              <PeakScene variant={img} animated={false} />
              <i className={`bi bi-${ICONS[img] || 'image'}`} />
            </button>
          </div>
        ))}
      </div>
      <Modal show={!!open} size="xl" title={`${title} – зумиран приказ`} onClose={() => setOpen(null)}
        footer={(
          <div className="d-flex align-items-center gap-2 w-100">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setZoom((z) => clamp(z - 0.5))} aria-label="Одзумирај"><i className="bi bi-zoom-out" /></button>
            <input type="range" className="form-range flex-grow-1" min={1} max={4} step={0.25} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} aria-label="Ниво на зумирање" />
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setZoom((z) => clamp(z + 0.5))} aria-label="Зумирај"><i className="bi bi-zoom-in" /></button>
            <span className="small text-muted" style={{ width: 48 }}>{Math.round(zoom * 100)}%</span>
          </div>
        )}>
        {open && (
          <div className={`zoom-stage ${open}`}
            onWheel={(e) => setZoom((z) => clamp(z + (e.deltaY < 0 ? 0.25 : -0.25)))}
            onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2))}>
            <div className="zoom-inner" style={{ transform: `scale(${zoom})` }}>
              <PeakScene variant={open} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
