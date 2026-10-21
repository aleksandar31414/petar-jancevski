import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.service';
import { PageHeader } from '../components/Layout.jsx';
import TourForm from '../components/TourForm.jsx';
import { ErrorAlert, Loader, Timeline, useTitle } from '../components/ui.jsx';
import { datum } from '../pipes';

/** Прегледување и уредување на елемент + историја на измени. */
export default function TourEditPage() {
  useTitle('Уреди тура');
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [history, setHistory] = useState([]);
  const [regs, setRegs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getTour(id), api.getTourHistory(id), api.getTourRegistrations(id)])
      .then(([t, h, r]) => { setTour(t); setHistory(h); setRegs(r); })
      .catch(setError);
  }, [id]);

  async function save(data) {
    await api.updateTour(id, data);
    navigate(`/ture/${id}`);
  }

  if (error) return <div className="container mt-4"><ErrorAlert error={error} /></div>;
  if (!tour) return <Loader />;

  return (
    <>
      <PageHeader title="Преглед и уредување на тура" subtitle={tour.updatedAt ? `Последна измена: ${datum(tour.updatedAt)}` : ''}
        crumbs={[{ label: 'Тури', to: '/ture' }, { label: tour.title, to: `/ture/${id}` }, { label: 'Уреди' }]} />
      <div className="container">
        <div className="alert alert-info small"><i className="bi bi-pencil-square me-1" />
          Ги уредувате податоците на постоечка тура. Пријавени учесници: {tour.registeredCount}{tour.waitingCount ? ` (+${tour.waitingCount} на чекање)` : ''}.
        </div>
        <TourForm tour={tour} submitLabel="Зачувај промени" onSubmit={save} cancelTo={`/ture/${id}`} />
        <div className="row g-4 mt-1">
          <div className="col-lg-6">
            <div className="panel h-100">
              <h2 className="h6">Историја на измени</h2>
              <Timeline items={history.map((a) => ({ key: a._id, when: `${datum(a.createdAt)} ${a.createdAt.toLocaleTimeString('mk-MK', { hour: '2-digit', minute: '2-digit' })}`, text: a.message }))} />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="panel h-100">
              <h2 className="h6">Пријавени учесници ({regs.length})</h2>
              {!regs.length && <p className="small text-muted mb-0">Нема пријави.</p>}
              <ol className="small mb-0">
                {regs.map((r) => (
                  <li key={r._id}>{r.user?.name} – {r.user?.phone || r.user?.email}{r.needsTransport ? ' · превоз' : ''}
                    {r.status === 'cekanje' && <span className="badge bg-warning text-dark ms-1">чека</span>}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
