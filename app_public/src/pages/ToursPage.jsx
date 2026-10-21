import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.service';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import TourCard from '../components/TourCard.jsx';
import { ErrorAlert, Loader, Pagination, useTitle } from '../components/ui.jsx';
import { TEZINI } from '../pipes';

const SORTS = { date: 'по датум', difficulty: 'по тежина', free: 'по слободни места' };

/** Printout на листа на елементи. Филтрите се во URL-то, па напред/назад во прелистувачот работи. */
export default function ToursPage() {
  useTitle('Сите тури');
  const { isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const difficulty = params.get('difficulty') || '';
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'date';
  const period = params.get('period') === 'past' ? 'past' : 'upcoming';
  const page = Number(params.get('page')) || 1;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    setData(null);
    api.getTours({ difficulty, sort, period, page, limit: 9 }).then(setData).catch(setError);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [difficulty, sort, period, page]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  return (
    <>
      <PageHeader title={period === 'past' ? 'Минати тури' : 'Сите тури'} subtitle="Листа на закажани тури со пополнетост и тежина" crumbs={[{ label: 'Тури' }]} />
      <div className="container">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <div className="btn-group btn-group-sm flex-wrap" role="group" aria-label="Тежина">
            <button type="button" className={`btn ${!difficulty ? 'btn-forest' : 'btn-outline-forest'}`} onClick={() => update({ difficulty: '' })}>Сите</button>
            {Object.entries(TEZINI).map(([k, v]) => (
              <button type="button" key={k} className={`btn ${difficulty === k ? 'btn-forest' : 'btn-outline-forest'}`} onClick={() => update({ difficulty: k })}>{v}</button>
            ))}
          </div>
          <div className="d-flex flex-wrap gap-2">
            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={period} onChange={(e) => update({ period: e.target.value === 'past' ? 'past' : '' })} aria-label="Период">
              <option value="upcoming">Наредни</option>
              <option value="past">Минати</option>
            </select>
            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={sort} onChange={(e) => update({ sort: e.target.value === 'date' ? '' : e.target.value })} aria-label="Подредување">
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Подреди: {v}</option>)}
            </select>
            {isAdmin && (
              <>
                <Link to="/admin/izvestaj" className="btn btn-sm btn-outline-secondary"><i className="bi bi-printer me-1" />Извештај</Link>
                <Link to="/ture/nova" className="btn btn-sm btn-warning"><i className="bi bi-plus-lg me-1" />Нова тура</Link>
              </>
            )}
          </div>
        </div>
        <ErrorAlert error={error} onRetry={load} />
        {!data && !error && <Loader />}
        {data && (
          <>
            <p className="small text-muted">Пронајдени: {data.total}</p>
            <div className="row g-4">
              {data.items.map((t) => <TourCard key={t._id} tour={t} admin={isAdmin} />)}
            </div>
            {!data.items.length && <p className="text-muted">Нема тури за избраниот филтер.</p>}
            <Pagination page={data.page} pages={data.pages} onChange={(p) => update({ page: p > 1 ? String(p) : '' })} />
          </>
        )}
      </div>
    </>
  );
}
