// Трансформациски цевки (pipes) – мали чисти функции кои ги форматираат податоците во приказите.
// pipe(...) ги поврзува во синџир: pipe(skrati(40), golemaPrvaBukva)(tekst)

/** Синџир на функции кои се извршуваат една по друга. */
export const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

const DAYS = ['недела', 'понеделник', 'вторник', 'среда', 'четврток', 'петок', 'сабота'];
const MONTHS = ['Јан', 'Фев', 'Мар', 'Апр', 'Мај', 'Јун', 'Јул', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек'];

/** 1) Датум: 14.11.2026 */
export function datum(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

/** 2) Долг датум: сабота, 14.11.2026 */
export function datumSoDen(value) {
  if (!value) return '';
  return `${DAYS[new Date(value).getDay()]}, ${datum(value)}`;
}

/** 2б) Краток ден: Саб 14.11 */
const SHORT_DAYS = ['Нед', 'Пон', 'Вто', 'Сре', 'Чет', 'Пет', 'Саб'];
export function denKratko(value) {
  const d = new Date(value);
  return `${SHORT_DAYS[d.getDay()]} ${datum(d).slice(0, 5)}`;
}

/** 3) Тежина: sredna → Средна */
export const TEZINI = { lesna: 'Лесна', sredna: 'Средна', teshka: 'Тешка' };
export function tezina(key) {
  return TEZINI[key] || key;
}

/** 4) Цена во денари: 600 → 600 ден., 0 → Бесплатно */
export function denari(value) {
  const n = Number(value) || 0;
  return n === 0 ? 'Бесплатно' : `${n.toLocaleString('mk-MK')} ден.`;
}

/** 5) Скратување текст: skrati(40)(текст) */
export const skrati = (max = 100) => (text = '') => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/** 6) Релативно време: пред 2 дена */
export function relativnoVreme(value) {
  if (!value) return '';
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return 'пред малку';
  if (diff < 3600) return `пред ${Math.floor(diff / 60)} мин.`;
  if (diff < 86400) return `пред ${Math.floor(diff / 3600)} ч.`;
  const days = Math.floor(diff / 86400);
  if (days < 30) return `пред ${days} ${days === 1 ? 'ден' : 'дена'}`;
  return datum(value);
}

/** 7) Улога: admin → Администратор */
export function uloga(role) {
  return { admin: 'Администратор', user: 'Корисник' }[role] || 'Гостин';
}

/** 8) Месец: {year, month} → Ное 2026 */
export function mesec({ year, month }) {
  return `${MONTHS[month - 1]} ${year}`;
}

/** 9) Ѕвезди: 4 → ★★★★☆ */
export function dzvezdi(n) {
  const r = Math.round(Number(n) || 0);
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}

/** 10) WMO временски код (Open-Meteo) → опис и икона */
const WMO = [
  [[0], 'Ведро', 'sun-fill text-warning'],
  [[1, 2], 'Делумно облачно', 'cloud-sun-fill text-warning'],
  [[3], 'Облачно', 'cloud-fill text-secondary'],
  [[45, 48], 'Магла', 'cloud-fog2-fill text-secondary'],
  [[51, 53, 55, 56, 57], 'Ситен дожд', 'cloud-drizzle-fill text-primary'],
  [[61, 63, 65, 66, 67, 80, 81, 82], 'Дожд', 'cloud-rain-heavy-fill text-primary'],
  [[71, 73, 75, 77, 85, 86], 'Снег', 'cloud-snow-fill text-info'],
  [[95, 96, 99], 'Грмотевици', 'cloud-lightning-rain-fill text-danger'],
];
export function vreme(code) {
  const hit = WMO.find(([codes]) => codes.includes(code));
  return hit ? { text: hit[1], icon: hit[2] } : { text: 'Непознато', icon: 'question-circle' };
}

/** 11) Температура: 6.24 → 6°C */
export function stepeni(value) {
  return value === null || value === undefined ? '–' : `${Math.round(value)}°C`;
}
