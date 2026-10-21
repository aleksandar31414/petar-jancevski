import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { uloga } from '../pipes';
import { LogoMark, RidgeBand } from './Scenery.jsx';

/** Навигација – повторно употребена на сите страници; содржината зависи од улогата. */
export function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/', label: 'Почетна', icon: 'house', end: true },
    { to: '/ture', label: 'Тури', icon: 'signpost-split' },
    { to: '/prebaruvanje', label: 'Пребарување', icon: 'search' },
    { to: '/prognoza', label: 'Прогноза', icon: 'cloud-sun' },
    isLoggedIn && { to: '/profil', label: 'Мој профил', icon: 'person' },
    isAdmin && { to: '/admin', label: 'Админ', icon: 'speedometer2' },
  ].filter(Boolean);

  const closeMenu = () => document.getElementById('mainNav')?.classList.remove('show');
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const overHero = pathname === '/' && !scrolled;

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark fixed-top vt-nav ${overHero ? 'is-clear' : 'is-solid'}`}>
      <div className="container">
        <Link className="navbar-brand vt-brand" to="/" onClick={closeMenu}><LogoMark />Врв<span>Тура</span></Link>
        <button className="navbar-toggler" type="button" aria-label="Мени"
          onClick={() => document.getElementById('mainNav').classList.toggle('show')}>
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto">
            {links.map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink className="nav-link" to={l.to} end={l.end} onClick={closeMenu}>
                  <i className={`bi bi-${l.icon} me-1`} />{l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center gap-2 pb-2 pb-lg-0">
            <span className={`badge role-badge ${isAdmin ? 'bg-warning text-dark' : isLoggedIn ? 'bg-success' : 'bg-secondary'}`}>
              <i className="bi bi-person-badge me-1" />{uloga(user?.role)}{user ? `: ${user.name}` : ''}
            </span>
            {isLoggedIn ? (
              <button type="button" className="btn btn-sm btn-outline-light" onClick={() => { logout(); closeMenu(); navigate('/'); }}>
                <i className="bi bi-box-arrow-right me-1" />Одјава
              </button>
            ) : (
              <Link to="/najava" className="btn btn-sm btn-outline-light" onClick={closeMenu}><i className="bi bi-box-arrow-in-right me-1" />Најава</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <RidgeBand />
      <div className="container footer-inner">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center">
          <div>
            <div className="vt-brand mb-1"><LogoMark size={26} />Врв<span>Тура</span></div>
            <span className="small">© 2026 ВрвТура – организатор на планинарски тури</span>
          </div>
        <span>
          Прогноза: <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a> ·{' '}
          <a href="/api/docs/">REST API</a> · <Link to="/db">/db</Link> · <a href="/del1/">Маски (Дел 1)</a>
        </span>
        </div>
      </div>
    </footer>
  );
}

/** Заглавие на страница со патека (breadcrumb). */
export function PageHeader({ title, subtitle, crumbs = [] }) {
  return (
    <section className="page-head">
      <div className="ph-glow" aria-hidden="true" />
      <div className="container position-relative">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb small mb-2">
            <li className="breadcrumb-item"><Link to="/">Почетна</Link></li>
            {crumbs.map((c, i) => (
              <li key={c.label} className={`breadcrumb-item ${i === crumbs.length - 1 ? 'active' : ''}`}>
                {i === crumbs.length - 1 || !c.to ? c.label : <Link to={c.to}>{c.label}</Link>}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="h3 mb-1">{title}</h1>
        {subtitle && <p className="mb-0 opacity-75">{subtitle}</p>}
      </div>
      <RidgeBand />
    </section>
  );
}
