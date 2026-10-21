import { useState } from 'react';
import { api } from '../services/api.service';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import Modal from '../components/Modal.jsx';
import { ErrorAlert, useTitle } from '../components/ui.jsx';

/** /db – бришење на сите податоци и внесување иницијални податоци (за тестирање). */
export default function DbPage() {
  useTitle('/db');
  const { logout, isLoggedIn } = useAuth();
  const [confirm, setConfirm] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    const action = confirm;
    setConfirm(null);
    setBusy(true);
    setError(null);
    try {
      const res = action === 'delete' ? await api.dbDeleteAll() : await api.dbSeed();
      setResult(res);
      if (isLoggedIn) logout(); // старите сметки повеќе не постојат
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  const counts = result && (result.counts || result.deleted);

  return (
    <>
      <PageHeader title="Страница /db" subtitle="Алатка за тестирање – враќање на базата во почетна состојба" crumbs={[{ label: '/db' }]} />
      <div className="container">
        <ErrorAlert error={error} />
        <div className="row g-4 justify-content-center">
          <div className="col-md-6">
            <div className="panel h-100 text-center">
              <i className="bi bi-database-x text-danger" style={{ fontSize: '2.5rem' }} />
              <h2 className="h5 mt-2">Избриши ги сите податоци</h2>
              <p className="small text-muted">Ги празни сите 7 колекции: корисници, врвови, опрема, тури, пријави, коментари, активности.</p>
              <button type="button" className="btn btn-danger" disabled={busy} onClick={() => setConfirm('delete')}><i className="bi bi-trash me-1" />Избриши сè</button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="panel h-100 text-center">
              <i className="bi bi-database-add text-success" style={{ fontSize: '2.5rem' }} />
              <h2 className="h5 mt-2">Внеси иницијални податоци</h2>
              <p className="small text-muted">Ја празни базата и внесува 14 врвови, 8 предмети опрема, 13 корисници (3 водичи), 24 тури, пријави, коментари и активности.</p>
              <button type="button" className="btn btn-forest" disabled={busy} onClick={() => setConfirm('seed')}><i className="bi bi-upload me-1" />Внеси податоци</button>
            </div>
          </div>
          {busy && <div className="col-12 text-center"><span className="spinner-border spinner-border-sm me-1" />Се извршува…</div>}
          {result && (
            <div className="col-12">
              <div className="alert alert-success small mb-0">
                <i className="bi bi-check-circle me-1" />{result.message}
                <ul className="mb-0 mt-1">{Object.entries(counts).map(([k, v]) => <li key={k}>{k}: {v}</li>)}</ul>
                {result.counts && <div className="mt-2">Тест сметки: <strong>admin@vrvtura.mk / Admin1234</strong> (администратор), <strong>ana@vrvtura.mk / Korisnik123</strong> (корисник).</div>}
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal show={!!confirm} title="Потврда" onClose={() => setConfirm(null)}
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setConfirm(null)}>Откажи</button>
          <button type="button" className={`btn ${confirm === 'delete' ? 'btn-danger' : 'btn-forest'}`} onClick={run}>Продолжи</button></>}>
        {confirm === 'delete' ? 'Сите податоци ќе бидат трајно избришани.' : 'Постоечките податоци ќе бидат избришани и заменети со иницијалните.'} Дали сте сигурни?
      </Modal>
    </>
  );
}
