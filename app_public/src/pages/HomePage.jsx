import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.service';
import { useAuth } from '../context/AuthContext.jsx';
import TourCard from '../components/TourCard.jsx';
import { TourWeather } from '../components/Weather.jsx';
import { ErrorAlert, Loader, useTitle } from '../components/ui.jsx';
import { MountainHero, Reveal, CountUp, PeakScene } from '../components/Scenery.jsx';
import { datumSoDen } from '../pipes';

const STEPS = [
  { icon: 'search', title: 'Избери тура', text: 'Филтрирај по тежина, датум и врв.' },
  { icon: 'cloud-sun', title: 'Провери го времето', text: 'Прогноза за врвот на денот на турата.' },
  { icon: 'person-check', title: 'Пријави се', text: 'Со еден клик – или на листа на чекање.' },
  { icon: 'flag', title: 'Освој го врвот', text: 'Потоа остави оцена и коментар.' },
];

const LEVELS = [
  { k: 'lesna', label: 'Лесна', text: 'За почетници и семејства, до 4 часа одење.', v: 'g2' },
  { k: 'sredna', label: 'Средна', text: 'Подолги тури со поголемо искачување.', v: 'g1' },
  { k: 'teshka', label: 'Тешка', text: 'Високи врвови, карпи и снег – за искусни.', v: 'g4' },
];

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
      <MountainHero>
        <div className="row align-items-center g-4">
          <div className="col-lg-7 hero-copy">
            <span className="hero-kicker"><i className="bi bi-compass" />Организирани тури низ Македонија</span>
            <h1 className="hero-title">
              Следниот врв<br /><span className="grad-text">те чека.</span>
            </h1>
            <p className="hero-lead">Најди тура според тежина и датум, види ја прогнозата за самиот врв и пријави се со еден клик.</p>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/ture" className="btn btn-sun btn-lg"><i className="bi bi-signpost-split me-2" />Види ги турите</Link>
              {!isLoggedIn && <Link to="/najava?tab=registracija" className="btn btn-glass btn-lg">Регистрирај се</Link>}
            </div>
          </div>
          <div className="col-lg-5">
            <div className="glass-card">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="pulse-dot" />
                <h6 className="mb-0">Прогноза за следната тура</h6>
              </div>
              {next ? (
                <>
                  <p className="small mb-2 opacity-75">{next.location?.name} ({next.location?.elevation} м) · {datumSoDen(next.date)} · Open-Meteo</p>
                  <div className="glass-inner"><TourWeather location={next.location} dateIso={next.dateInput} /></div>
                  <Link to={`/ture/${next._id}`} className="glass-link mt-2">{next.title} <i className="bi bi-arrow-right" /></Link>
                </>
              ) : <p className="small mb-0 opacity-75">{tours ? 'Нема закажани тури.' : 'Се вчитува…'}</p>}
            </div>
          </div>
        </div>
        <a href="#prodolzi" className="scroll-cue" aria-label="Продолжи надолу"><i className="bi bi-chevron-double-down" /></a>
      </MountainHero>

      <section id="prodolzi" className="stats-strip">
        <div className="container">
          <div className="row g-3">
            {[
              [stats?.upcomingTours, 'Закажани тури', 'calendar2-week'],
              [stats?.users, 'Планинари', 'people'],
              [stats?.locations, 'Врвови', 'triangle'],
              [stats?.avgRating ?? '–', 'Просечна оцена', 'star'],
            ].map(([v, l, ic], i) => (
              <Reveal className="col-6 col-md-3" key={l} delay={i * 90}>
                <div className="alt-stat">
                  <i className={`bi bi-${ic}`} />
                  <div className="num">{stats ? <CountUp value={v} /> : '–'}</div>
                  <div className="lbl">{l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <ErrorAlert error={error} onRetry={load} />

        <Reveal className="section-head">
          <span className="eyebrow">Наредни тури</span>
          <div className="d-flex justify-content-between align-items-end gap-3">
            <h2 className="section-title mb-0">Тргнуваме наскоро</h2>
            <Link to="/ture" className="link-arrow">Сите тури <i className="bi bi-arrow-right" /></Link>
          </div>
        </Reveal>
        {!tours && !error && <Loader />}
        {tours && (
          <div className="row g-4">
            {tours.map((t, i) => <TourCard key={t._id} tour={t} delay={i * 120} />)}
            {!tours.length && <p className="text-muted">Нема закажани тури. Ако базата е празна, отворете <Link to="/db">/db</Link>.</p>}
          </div>
        )}

        <Reveal className="section-head mt-5">
          <span className="eyebrow">Како функционира</span>
          <h2 className="section-title">Од клик до врв</h2>
        </Reveal>
        <div className="trail-steps">
          {STEPS.map((s, i) => (
            <Reveal className="trail-step" key={s.title} delay={i * 120}>
              <span className="trail-num">{i + 1}</span>
              <i className={`bi bi-${s.icon}`} />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="section-head mt-5">
          <span className="eyebrow">Тежина на турите</span>
          <h2 className="section-title">Избери според кондицијата</h2>
        </Reveal>
        <div className="row g-4">
          {LEVELS.map((l, i) => (
            <Reveal className="col-md-4" key={l.k} delay={i * 120}>
              <Link to={`/ture?difficulty=${l.k}`} className="level-card">
                <PeakScene variant={l.v} />
                <div className="level-body">
                  <span className={`badge diff-${l.k}`}>{l.label}</span>
                  <p className="mb-0 mt-2">{l.text}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="cta-band mt-5">
          <PeakScene variant="g6" className="cta-art" />
          <div className="cta-copy">
            <h2>Планината не чека.</h2>
            <p>Провери ја прогнозата за викендов и резервирај место додека има слободни.</p>
            <Link to="/prognoza" className="btn btn-sun"><i className="bi bi-cloud-sun me-2" />Прогноза за врвовите</Link>
          </div>
        </Reveal>
      </div>
    </>
  );
}
