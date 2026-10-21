import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.service';
import { PageHeader } from '../components/Layout.jsx';
import TourForm from '../components/TourForm.jsx';
import { useTitle } from '../components/ui.jsx';

export default function TourAddPage() {
  useTitle('Нова тура');
  const navigate = useNavigate();

  async function save(data) {
    const tour = await api.createTour(data);
    navigate(`/ture/${tour._id}`);
  }

  return (
    <>
      <PageHeader title="Додај нова тура" subtitle="Достапно само за администратор/водич" crumbs={[{ label: 'Тури', to: '/ture' }, { label: 'Нова тура' }]} />
      <div className="container">
        <TourForm submitLabel="Зачувај тура" onSubmit={save} cancelTo="/ture" />
      </div>
    </>
  );
}
