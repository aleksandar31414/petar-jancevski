import { Link } from 'react-router-dom';
import { useTitle } from '../components/ui.jsx';

export default function NotFoundPage() {
  useTitle('Не постои');
  return (
    <div className="container text-center py-5">
      <i className="bi bi-signpost-2 text-forest" style={{ fontSize: '4rem' }} />
      <h1 className="h3 mt-3">Се изгубивте од патеката</h1>
      <p className="text-muted">Страницата што ја барате не постои.</p>
      <Link to="/" className="btn btn-forest">Назад на почетна</Link>
    </div>
  );
}
