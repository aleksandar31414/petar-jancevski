// Дополнителен модул за рутирање (насочување). Секој екран од Дел 1 има своја рута и компонента.
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import ToursPage from '../pages/ToursPage.jsx';
import TourDetailPage from '../pages/TourDetailPage.jsx';
import TourAddPage from '../pages/TourAddPage.jsx';
import TourEditPage from '../pages/TourEditPage.jsx';
import TourDeletePage from '../pages/TourDeletePage.jsx';
import SearchPage from '../pages/SearchPage.jsx';
import WeatherPage from '../pages/WeatherPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import AdminPage from '../pages/AdminPage.jsx';
import ReportPage from '../pages/ReportPage.jsx';
import DbPage from '../pages/DbPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

/** Само за најавени корисници – гостинот се праќа на најава и потоа се враќа назад. */
function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) return <Navigate to="/najava" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

/** Само за администратор. */
function RequireAdmin({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) return <Navigate to="/najava" replace state={{ from: location.pathname + location.search }} />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export const ROUTES = [
  { path: '/', element: <HomePage /> },
  { path: '/najava', element: <LoginPage /> },
  { path: '/ture', element: <ToursPage /> },
  { path: '/ture/nova', element: <RequireAdmin><TourAddPage /></RequireAdmin> },
  { path: '/ture/:id', element: <TourDetailPage /> },
  { path: '/ture/:id/uredi', element: <RequireAdmin><TourEditPage /></RequireAdmin> },
  { path: '/ture/:id/izbrishi', element: <RequireAdmin><TourDeletePage /></RequireAdmin> },
  { path: '/prebaruvanje', element: <SearchPage /> },
  { path: '/prognoza', element: <WeatherPage /> },
  { path: '/profil', element: <RequireAuth><ProfilePage /></RequireAuth> },
  { path: '/admin', element: <RequireAdmin><AdminPage /></RequireAdmin> },
  { path: '/admin/izvestaj', element: <RequireAdmin><ReportPage /></RequireAdmin> },
  { path: '/db', element: <DbPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export default function AppRoutes() {
  return (
    <Routes>
      {ROUTES.map((r) => <Route key={r.path} path={r.path} element={r.element} />)}
    </Routes>
  );
}
