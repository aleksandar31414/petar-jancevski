import { Link } from 'react-router-dom';
import { DifficultyBadge } from './ui.jsx';
import { PeakScene, Reveal } from './Scenery.jsx';
import { datum, denari, pipe, skrati } from '../pipes';

const shortTitle = pipe((t) => t.trim(), skrati(45));

/**
 * Картичка за тура – се користи на почетна, листа на тури и пребарување.
 * @param {{tour: import('../models').Tour, admin?: boolean, delay?: number}} props
 */
export default function TourCard({ tour, admin = false, delay = 0 }) {
  return (
    <Reveal className="col-12 col-sm-6 col-lg-4" delay={delay}>
      <div className="card tour-card h-100">
        <div className={`tour-img ${tour.cover}`}>
          <PeakScene variant={tour.cover} label={tour.location?.name} />
          <span className="tour-icon"><i className={`bi bi-${tour.icon}`} /></span>
          {tour.location?.elevation ? <span className="elev-chip"><i className="bi bi-triangle-fill" />{tour.location.elevation} м</span> : null}
          <DifficultyBadge value={tour.difficulty} />
        </div>
        <div className="card-body">
          <h5 className="card-title mb-1">{shortTitle(tour.title)}</h5>
          <p className="text-muted small mb-2">
            <i className="bi bi-geo-alt" /> {tour.location?.name} · <i className="bi bi-calendar-event" /> {datum(tour.date)}
          </p>
          <p className="small mb-2">
            <i className="bi bi-signpost" /> {tour.lengthKm} км · <i className="bi bi-clock" /> {tour.durationH} ч · <i className="bi bi-cash" /> {denari(tour.price)}
          </p>
          <div className="progress mb-1" style={{ height: 6 }} role="progressbar" aria-valuenow={tour.fillPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className={`progress-bar ${tour.isFull ? 'bg-danger' : 'bg-success'}`} style={{ width: `${tour.fillPercent}%` }} />
          </div>
          <p className="small text-muted mb-0">
            Пријавени: {tour.registeredCount} / {tour.capacity}
            {tour.isFull && <span className="text-danger ms-1">(полно{tour.waitingCount ? `, ${tour.waitingCount} чекаат` : ''})</span>}
            {tour.avgRating && <span className="float-end text-warning">★ {tour.avgRating}</span>}
          </p>
        </div>
        <div className="card-footer border-0 d-flex gap-2 pb-3">
          <Link to={`/ture/${tour._id}`} className="btn btn-sm btn-forest flex-grow-1">Детали</Link>
          {admin && (
            <>
              <Link to={`/ture/${tour._id}/uredi`} className="btn btn-sm btn-outline-secondary" title="Уреди" aria-label="Уреди"><i className="bi bi-pencil" /></Link>
              <Link to={`/ture/${tour._id}/izbrishi`} className="btn btn-sm btn-outline-danger" title="Избриши" aria-label="Избриши"><i className="bi bi-trash" /></Link>
            </>
          )}
        </div>
      </div>
    </Reveal>
  );
}
