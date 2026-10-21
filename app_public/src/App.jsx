import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout.jsx';
import AppRoutes from './routing/AppRoutes.jsx';

// Основен модул: униформен изглед (навигација + содржина + подножје) за сите страници
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);

  return (
    <>
      <Navbar />
      <main>
        <AppRoutes />
      </main>
      <Footer />
    </>
  );
}
