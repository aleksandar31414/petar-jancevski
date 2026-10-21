import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.service';
import { useAuth } from '../context/AuthContext.jsx';
import TourCard from '../components/TourCard.jsx';
import { TourWeather } from '../components/Weather.jsx';
import { ErrorAlert, Loader, StatCard, useTitle } from '../components/ui.jsx';
import { datumSoDen } from '../pipes';

export default function HomePage() {
  useTitle('Почетна');
  const { isLoggedIn } = useAuth();
  const [tours, setTours] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    Promise.all([api.getTours({ limit: 3 }), api.getStats()])
      .then(([t, s]) => { setTours(t.items); setStats(s); })
      .catch(setError);
  };
  useEffect(load, []);

  const next = tours && tours[0];

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark mb-3">Организирани тури низ Македонија</span>
              <h1 className="display-5 fw-bold">Пронајди ја следната тура и провери го времето на врвот</h1>
              <p className="lead opacity-75">Филтрирај тури според тежина и датум, види ја прогнозата за денот на турата и пријави се со еден клик.</p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/ture" className="btn btn-warning btn-lg"><i className="bi bi-signpost-split me-1" />Види ги турите</Link>
                {!isLoggedIn && <Link to="/najava?tab=registracija" className="btn btn-outline-light btn-lg">Регистрирај се</Link>}
              </div>
            </div>
            <div className="col-lg-5">
              <div className="panel text-dark">
                <h6 className="text-forest"><i className="bi bi-cloud-sun me-1" />Прогноза за следната тура</h6>
                {next ? (
                  <>
                    <p className="small text-muted mb-2">{next.location?.name} ({next.location?.elevation} м) · {datumSoDen(next.date)} · Open-Meteo</p>
                    <TourWeather location={next.location} dateIso={next.dateInput} />
                    <Link to={`/ture/${next._id}`} className="small d-inline-block mt-2">{next.title} →</Link>
                  </>
                ) : <p className="small text-muted mb-0">{tours ? 'Нема закажани тури.' : 'Се вчитува…'}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mt-4">
        <ErrorAlert error={error} onRetry={load} />
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3"><StatCard value={stats?.upcomingTours} label="Закажани тури" /></div>
          <div className="col-6 col-md-3"><StatCard value={stats?.users} label="Планинари" /></div>
          <div className="col-6 col-md-3"><StatCard value={stats?.locations} label="Врвови" /></div>
          <div className="col-6 col-md-3"><StatCard value={stats?.avgRating ?? '–'} label="Просечна оцена" /></div>
        </div>
        <div className="d-flex justify-content-between align-items-end mb-3">
          <h2 className="h4 mb-0">Наредни тури</h2>
          <Link to="/ture">Сите тури →</Link>
        </div>
        {!tours && !error && <Loader />}
        {tours && (
          <div className="row g-4">
            {tours.map((t) => <TourCard key={t._id} tour={t} />)}
            {!tours.length && <p className="text-muted">Нема закажани тури. Ако базата е празна, отворете <Link to="/db">/db</Link>.</p>}
          </div>
        )}
      </div>
    </>
  );
}
