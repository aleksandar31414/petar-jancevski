import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { api } from '../services/api.service';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import Modal from '../components/Modal.jsx';
import { ErrorAlert, Loader, StatCard, Timeline, useTitle } from '../components/ui.jsx';
import { mesec, relativnoVreme, TEZINI, uloga } from '../pipes';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminPage() {
  useTitle('Админ табла');
  const { user: me } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = useCallback(() => {
    Promise.all([api.getAdminStats(), api.getUsers(), api.getActivities(15)])
      .then(([s, u, a]) => { setStats(s); setUsers(u); setActivities(a); })
      .catch(setError);
  }, []);
  useEffect(load, [load]);

  async function changeRole(u, role) {
    try {
      await api.updateUser(u._id, { role });
      setNotice(`${u.name} сега е ${uloga(role).toLowerCase()}.`);
      load();
    } catch (err) {
      setError(err);
    }
  }

  async function removeUser() {
    try {
      await api.deleteUser(toDelete._id);
      setNotice(`Корисникот ${toDelete.name} е избришан.`);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err);
      setToDelete(null);
    }
  }

  if (!stats && !error) return <Loader />;

  return (
    <>
      <PageHeader title="Админ табла" subtitle="Целосен пристап до турите, корисниците и извештаите" crumbs={[{ label: 'Админ' }]} />
      <div className="container">
        <ErrorAlert error={error} />
        {notice && <div className="alert alert-success alert-dismissible small">{notice}<button type="button" className="btn-close" aria-label="Затвори" onClick={() => setNotice(null)} /></div>}
        {stats && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3"><StatCard value={stats.upcomingTours} label="Закажани тури" /></div>
              <div className="col-6 col-lg-3"><StatCard value={stats.users} label="Корисници" /></div>
              <div className="col-6 col-lg-3"><StatCard value={stats.registrationsThisMonth} label="Пријави овој месец" /></div>
              <div className="col-6 col-lg-3"><StatCard value={stats.avgRating ?? '–'} label="Просечна оцена" accent="#e8a33d" /></div>
            </div>
            <div className="row g-4 mb-4">
              <div className="col-lg-8">
                <div className="panel h-100">
                  <h2 className="h6">Потврдени учесници по месец (според датумот на турата)</h2>
                  <Bar
                    data={{
                      labels: stats.participantsByMonth.map(mesec),
                      datasets: [{ label: 'Учесници', data: stats.participantsByMonth.map((m) => m.participants), backgroundColor: '#4f7f5f', borderRadius: 6 }],
                    }}
                    options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }}
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="panel h-100">
                  <h2 className="h6">Тури по тежина</h2>
                  <Doughnut
                    data={{
                      labels: Object.values(TEZINI),
                      datasets: [{ data: Object.keys(TEZINI).map((k) => stats.toursByDifficulty[k]), backgroundColor: ['#3c9a5f', '#e8a33d', '#c0392b'] }],
                    }}
                    options={{ plugins: { legend: { position: 'bottom' } } }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="panel">
              <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
                <h2 className="h6 mb-0">Корисници ({users.length})</h2>
                <div className="d-flex gap-2">
                  <Link to="/ture/nova" className="btn btn-sm btn-warning"><i className="bi bi-plus-lg me-1" />Нова тура</Link>
                  <Link to="/admin/izvestaj" className="btn btn-sm btn-outline-secondary"><i className="bi bi-file-earmark-pdf me-1" />Извештај</Link>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-sm align-middle small mb-0">
                  <thead><tr><th>Име</th><th>Е-пошта</th><th>Улога</th><th>Пријави</th><th /></tr></thead>
                  <tbody>
                    {users.map((u) => {
                      const self = me && u._id === me._id;
                      return (
                        <tr key={u._id}>
                          <td>{u.name}{self && <span className="text-muted"> (вие)</span>}</td>
                          <td>{u.email}</td>
                          <td>
                            <select className="form-select form-select-sm" value={u.role} disabled={self} onChange={(e) => changeRole(u, e.target.value)} aria-label={`Улога на ${u.name}`}>
                              <option value="user">Корисник</option>
                              <option value="admin">Администратор</option>
                            </select>
                          </td>
                          <td>{u.registrationCount}</td>
                          <td>{!self && <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setToDelete(u)} aria-label={`Избриши ${u.name}`}><i className="bi bi-trash" /></button>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="panel">
              <h2 className="h6">Последни активности во системот</h2>
              <Timeline items={activities.map((a) => ({ key: a._id, when: relativnoVreme(a.createdAt), text: a.message }))} />
            </div>
          </div>
        </div>
      </div>
      <Modal show={!!toDelete} title="Бришење корисник" onClose={() => setToDelete(null)}
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setToDelete(null)}>Откажи</button><button type="button" className="btn btn-danger" onClick={removeUser}>Избриши</button></>}>
        Дали сигурно сакате да го избришете <strong>{toDelete?.name}</strong>? Ќе се избришат и неговите пријави и коментари.
      </Modal>
    </>
  );
}
