import { useEffect, useState } from 'react';
import { assess, getForecast } from '../services/weather.service';
import { stepeni, vreme, denKratko } from '../pipes';

/** Ја презема прогнозата за врвот од надворешниот сервис. */
export function useForecast(location) {
  const [state, setState] = useState({ data: null, error: null, loading: false });
  const key = location ? `${location.lat},${location.lon}` : '';
  useEffect(() => {
    if (!location) return undefined;
    let alive = true;
    setState({ data: null, error: null, loading: true });
    getForecast(location)
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => alive && setState({ data: null, error, loading: false }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}

/** Прогноза за денот на турата (детали за тура и профил). */
export function TourWeather({ location, dateIso, compact = false }) {
  const { data, error, loading } = useForecast(location);
  if (loading) return <span className="small text-muted"><span className="spinner-border spinner-border-sm me-1" />прогноза…</span>;
  if (error) return <span className="small text-danger">{error.message}</span>;
  if (!data) return null;
  const day = data.forDate(dateIso);
  if (!day) {
    return <span className="small text-muted">{compact ? '–' : 'Прогнозата е достапна најмногу 16 дена однапред.'}</span>;
  }
  const w = vreme(day.code);
  if (compact) return <span title={w.text}><i className={`bi bi-${w.icon}`} /> {stepeni(day.max)}</span>;
  const a = assess(day);
  return (
    <>
      <div className="d-flex align-items-center gap-3">
        <i className={`bi bi-${w.icon}`} style={{ fontSize: '2.5rem' }} />
        <div>
          <div className="fs-3 fw-bold">{Math.round(day.max)}° / {Math.round(day.min)}°C</div>
          <div className="small">{w.text} · Ветер {Math.round(day.wind)} км/ч · Врнежи {day.precipitation}%</div>
        </div>
      </div>
      <div className={`alert alert-${a.level} small mt-3 mb-0 py-2`}><i className="bi bi-info-circle me-1" />{a.text}</div>
    </>
  );
}

/** Картичка за еден ден во 7-дневната прогноза. */
export function WeatherDay({ day, highlight }) {
  const w = vreme(day.code);
  return (
    <div className={`weather-day ${highlight ? 'today' : ''}`}>
      <div className="small fw-semibold">{denKratko(`${day.date}T12:00:00`)}</div>
      <i className={`bi bi-${w.icon}`} title={w.text} />
      <div className="fw-bold">{stepeni(day.max)}</div>
      <div className="small text-muted">{stepeni(day.min)}</div>
      <div className="small text-primary"><i className="bi bi-droplet" /> {day.precipitation}%</div>
    </div>
  );
}
