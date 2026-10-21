import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout.jsx';
import AppRoutes from './routing/AppRoutes.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Основен модул: униформен изглед (навигација + содржина + подножје) за сите страници
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    // успешно прикажана страница – дозволи повторно автоматско вчитување ако подоцна падне
    const t = setTimeout(() => { try { sessionStorage.removeItem(`vt-reload:${pathname}`); } catch { /* */ } }, 4000);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      <Navbar />
      <main className={pathname === '/' ? 'is-home' : 'has-nav'}>
        <ErrorBoundary key={pathname}><div className="page-fade"><AppRoutes /></div></ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
