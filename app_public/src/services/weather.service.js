// Сервис за надворешна услуга: Open-Meteo API (https://open-meteo.com) – бесплатен, без API клуч.
// Базата ги чува само координатите на врвовите; прогнозата се презема во живо.

const BASE = 'https://api.open-meteo.com/v1/forecast';
const cache = new Map();

export class Forecast {
  constructor(json) {
    const c = json.current || {};
    this.current = {
      temperature: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      wind: c.wind_speed_10m,
      code: c.weather_code,
      time: c.time,
    };
    const d = json.daily || {};
    this.days = (d.time || []).map((date, i) => ({
      date,
      code: d.weather_code[i],
      max: d.temperature_2m_max[i],
      min: d.temperature_2m_min[i],
      precipitation: d.precipitation_probability_max[i],
      wind: d.wind_speed_10m_max[i],
      sunrise: d.sunrise[i],
      sunset: d.sunset[i],
    }));
  }

  /** Прогноза за одреден ден (yyyy-mm-dd) или null ако е надвор од 16-дневниот опсег. */
  forDate(isoDate) {
    return this.days.find((d) => d.date === isoDate) || null;
  }
}

/** Проценка дали условите се поволни за тура. */
export function assess(day) {
  if (!day) return null;
  if (day.precipitation >= 60 || day.wind >= 50 || [95, 96, 99].includes(day.code)) {
    return { level: 'danger', text: 'Неповолно – висок ризик од врнежи, силен ветер или невреме.' };
  }
  if (day.precipitation >= 30 || day.wind >= 35 || day.min <= -8) {
    return { level: 'warning', text: 'Внимание – можни врнежи, посилен ветер или многу ниски температури.' };
  }
  return { level: 'success', text: 'Поволно – мал ризик од врнежи и умерен ветер.' };
}

/**
 * @param {{lat:number, lon:number, elevation:number}} location
 * @returns {Promise<Forecast>}
 */
export async function getForecast({ lat, lon, elevation }) {
  const key = `${lat},${lon},${elevation}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < 15 * 60 * 1000) return cached.data;

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    elevation,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset',
    timezone: 'Europe/Skopje',
    forecast_days: 16,
  });
  let res;
  try {
    res = await fetch(`${BASE}?${params}`);
  } catch {
    throw new Error('Open-Meteo не е достапен. Проверете ја интернет врската.');
  }
  if (!res.ok) throw new Error(`Open-Meteo врати грешка (${res.status}).`);
  const data = new Forecast(await res.json());
  cache.set(key, { at: Date.now(), data });
  return data;
}
