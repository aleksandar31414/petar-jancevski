// Валидација на кориснички влезови со редовни изрази (ниво на клиент).
// Истите правила постојат и на серверот (app_api/utils/patterns.js).

export const RE = {
  name: /^[\p{L}][\p{L}' .-]{1,49}$/u,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^(\+389|0)\s?\d{2}\s?\d{3}\s?\d{3,4}$/,
  password: /^(?=.*\p{L})(?=.*\d).{8,64}$/u,
  time: /^([01]\d|2[0-3]):[0-5]\d$/,
  title: /^[\p{L}\p{N}][\p{L}\p{N} .,'"()\-–!?:]{4,79}$/u,
  date: /^\d{4}-\d{2}-\d{2}$/,
  search: /^[\p{L}\p{N} .,'-]{0,50}$/u,
};

export const DIFFICULTIES = ['lesna', 'sredna', 'teshka'];
export const EXPERIENCE = ['pocetnik', 'sreden', 'iskusen'];
export const REGIONS = ['Скопски', 'Пелагониски', 'Полошки', 'Југозападен', 'Вардарски', 'Источен', 'Југоисточен', 'Североисточен'];
export const COVERS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];
export const DELETE_REASONS = { vreme: 'Лоши временски услови', ucesnici: 'Недоволен број учесници', drugo: 'Друга причина' };

const inRange = (v, min, max, int = true) => {
  if (v === '' || v === null || v === undefined) return false;
  const n = Number(v);
  return Number.isFinite(n) && (!int || Number.isInteger(n)) && n >= min && n <= max;
};

export function validateLogin({ email, password }) {
  const e = {};
  if (!RE.email.test(email.trim())) e.email = 'Внесете валидна е-пошта (пр. ime@primer.mk).';
  if (!password) e.password = 'Внесете лозинка.';
  return e;
}

export function validateRegister(f) {
  const e = {};
  if (!RE.name.test(f.name.trim())) e.name = 'Само букви, 2–50 знаци.';
  if (!RE.email.test(f.email.trim())) e.email = 'Внесете валидна е-пошта.';
  if (f.phone.trim() && !RE.phone.test(f.phone.trim())) e.phone = 'Формат: 070 123 456 или +389 70 123 456.';
  if (!EXPERIENCE.includes(f.experience)) e.experience = 'Изберете ниво на искуство.';
  if (!RE.password.test(f.password)) e.password = '8–64 знаци, барем една буква и една бројка.';
  if (f.password !== f.password2) e.password2 = 'Лозинките не се совпаѓаат.';
  if (!f.terms) e.terms = 'Мора да се согласите со правилата.';
  return e;
}

export function validateProfile(f) {
  const e = {};
  if (!RE.name.test(f.name.trim())) e.name = 'Само букви, 2–50 знаци.';
  if (f.phone.trim() && !RE.phone.test(f.phone.trim())) e.phone = 'Формат: 070 123 456.';
  if (!EXPERIENCE.includes(f.experience)) e.experience = 'Изберете ниво на искуство.';
  if (f.password && !RE.password.test(f.password)) e.password = '8–64 знаци, барем една буква и една бројка.';
  return e;
}

export function validateTour(f, { isNew }) {
  const e = {};
  if (!RE.title.test(f.title.trim())) e.title = '5–80 знаци: букви, бројки и интерпункција.';
  if (!f.location) e.location = 'Изберете врв.';
  if (!DIFFICULTIES.includes(f.difficulty)) e.difficulty = 'Изберете тежина.';
  if (!RE.date.test(f.date)) e.date = 'Изберете датум.';
  else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNew && new Date(f.date) < today) e.date = 'Датумот мора да е денес или во иднина.';
  }
  if (!RE.time.test(f.meetTime)) e.meetTime = 'Формат ЧЧ:ММ.';
  if (f.meetPlace.length > 80) e.meetPlace = 'Најмногу 80 знаци.';
  if (!inRange(f.lengthKm, 1, 60, false)) e.lengthKm = 'Од 1 до 60 км.';
  if (!inRange(f.ascentM, 0, 3000)) e.ascentM = 'Цел број од 0 до 3000 м.';
  if (!inRange(f.durationH, 1, 24, false)) e.durationH = 'Од 1 до 24 часа.';
  if (!inRange(f.capacity, 2, 60)) e.capacity = 'Цел број од 2 до 60.';
  if (!inRange(f.price, 0, 20000)) e.price = 'Цел број од 0 до 20000.';
  if (f.description.length > 1500) e.description = 'Најмногу 1500 знаци.';
  if (!COVERS.includes(f.cover)) e.cover = 'Изберете насловна слика.';
  return e;
}

export function validateComment({ text, rating }, { isReply }) {
  const e = {};
  const t = text.trim();
  if (t.length < 2 || t.length > 500) e.text = 'Коментарот мора да има 2–500 знаци.';
  if (!isReply && rating && !inRange(rating, 1, 5)) e.rating = 'Оцена од 1 до 5.';
  return e;
}
