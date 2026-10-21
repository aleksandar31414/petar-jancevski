import { useEffect, useState } from 'react';
import { api } from '../services/api.service';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import { ErrorAlert, Loader, useTitle } from '../components/ui.jsx';
import { datum, tezina } from '../pipes';

/** Генерирање извештај – приказ за печатење и PDF од серверот (pdfkit). */
export default function ReportPage() {
  useTitle('Извештај');
  const { user } = useAuth();
  const [tours, setTours] = useState(null);
  const [regs, setRegs] = useState({});
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      const { items } = await api.getTours({ limit: 50 });
      const lists = await Promise.all(items.map((t) => api.getTourRegistrations(t._id)));
      setRegs(Object.fromEntries(items.map((t, i) => [t._id, lists[i]])));
      setTours(items);
    })().catch(setError);
  }, []);

  async function downloadPdf() {
    setDownloading(true);
    try {
      const blob = await api.downloadReport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vrvtura-izvestaj.pdf';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err);
    } finally {
      setDownloading(false);
    }
  }

  if (!tours && !error) return <Loader />;
  const total = tours ? tours.reduce((s, t) => s + t.registeredCount, 0) : 0;
  const cap = tours ? tours.reduce((s, t) => s + t.capacity, 0) : 0;

  return (
    <>
      <PageHeader title="Извештај за наредните тури" subtitle="Подготвено за печатење или преземање како PDF" crumbs={[{ label: 'Админ', to: '/admin' }, { label: 'Извештај' }]} />
      <div className="container">
        <ErrorAlert error={error} />
        {tours && (
          <div className="panel">
            <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h2 className="h5 mb-0">ВрвТура – извештај</h2>
                <small className="text-muted">Генериран: {datum(new Date())} · {user?.name}</small>
              </div>
              <div className="d-flex gap-2 no-print">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}><i className="bi bi-printer me-1" />Печати</button>
                <button type="button" className="btn btn-sm btn-forest" disabled={downloading} onClick={downloadPdf}><i className="bi bi-file-earmark-pdf me-1" />Преземи PDF</button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-bordered small">
                <thead className="table-light"><tr><th>#</th><th>Тура</th><th>Датум</th><th>Тежина</th><th>Врв</th><th>Пријавени</th></tr></thead>
                <tbody>
                  {tours.map((t, i) => (
                    <tr key={t._id}><td>{i + 1}</td><td>{t.title}</td><td>{datum(t.date)}</td><td>{tezina(t.difficulty)}</td><td>{t.location?.name}</td><td>{t.registeredCount}/{t.capacity}</td></tr>
                  ))}
                </tbody>
                <tfoot><tr><th colSpan={5} className="text-end">Вкупно пријавени</th><th>{total}/{cap}</th></tr></tfoot>
              </table>
            </div>
            {tours.map((t) => (
              <div key={t._id} className="mb-3">
                <h3 className="h6 mb-1">{t.title} – {datum(t.date)} во {t.meetTime}</h3>
                {!regs[t._id]?.length
                  ? <p className="small text-muted mb-0">Нема пријавени учесници.</p>
                  : (
                    <ol className="small mb-0">
                      {regs[t._id].map((r) => (
                        <li key={r._id}>{r.user?.name}{r.user?.phone ? ` – ${r.user.phone}` : ''} – превоз: {r.needsTransport ? 'да' : 'не'}{r.status === 'cekanje' ? ' (листа на чекање)' : ''}</li>
                      ))}
                    </ol>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
