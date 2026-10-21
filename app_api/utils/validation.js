// Валидација на ниво на апликација – пред податоците да стигнат до Mongoose шемата.
const P = require('./patterns');
const { HttpError } = require('./errors');

const isEmpty = (v) => v === undefined || v === null || v === '';

function fail(errors) {
  if (Object.keys(errors).length) throw new HttpError(400, 'Невалидни податоци.', errors);
}

function toNumber(v) {
  if (isEmpty(v)) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function checkRange(errors, data, field, label, min, max, integer = true) {
  const n = data[field];
  if (n === undefined) return;
  if (Number.isNaN(n) || (integer && !Number.isInteger(n))) errors[field] = `${label} мора да биде ${integer ? 'цел ' : ''}број.`;
  else if (n < min || n > max) errors[field] = `${label} мора да е меѓу ${min} и ${max}.`;
}

function validateRegister(body) {
  const errors = {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const password = String(body.password || '');
  if (!P.NAME_RE.test(name)) errors.name = 'Името смее да содржи само букви (2–50 знаци).';
  if (!P.EMAIL_RE.test(email)) errors.email = 'Невалидна е-пошта.';
  if (phone && !P.PHONE_RE.test(phone)) errors.phone = 'Телефонот мора да биде во формат 070 123 456.';
  if (!P.PASSWORD_RE.test(password)) errors.password = 'Лозинката мора да има 8–64 знаци, барем една буква и една бројка.';
  if (body.experience && !P.EXPERIENCE.includes(body.experience)) errors.experience = 'Невалидно ниво на искуство.';
  fail(errors);
  return { name, email, phone: phone || undefined, password, experience: body.experience || 'pocetnik' };
}

function validateLogin(body) {
  const errors = {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!P.EMAIL_RE.test(email)) errors.email = 'Невалидна е-пошта.';
  if (!password) errors.password = 'Внесете лозинка.';
  fail(errors);
  return { email, password };
}

const TOUR_FIELDS = ['title', 'location', 'guide', 'difficulty', 'date', 'meetTime', 'meetPlace', 'lengthKm', 'ascentM',
  'durationH', 'capacity', 'price', 'description', 'equipment', 'cover', 'gallery'];

/**
 * @param {object} body
 * @param {{partial:boolean, allowPast:boolean}} opts partial=true при PUT (се проверуваат само испратените полиња)
 */
function validateTour(body, { partial = false, allowPast = false } = {}) {
  const errors = {};
  const data = {};
  for (const f of TOUR_FIELDS) if (body[f] !== undefined) data[f] = body[f];
  const required = ['title', 'location', 'difficulty', 'date', 'meetTime', 'lengthKm', 'ascentM', 'durationH', 'capacity', 'price'];
  if (!partial) for (const f of required) if (isEmpty(data[f])) errors[f] = 'Полето е задолжително.';

  if (data.title !== undefined) {
    data.title = String(data.title).trim();
    if (!P.TITLE_RE.test(data.title)) errors.title = 'Називот мора да има 5–80 знаци (букви, бројки и интерпункција).';
  }
  for (const ref of ['location', 'guide']) {
    if (!isEmpty(data[ref]) && !P.OBJECT_ID_RE.test(String(data[ref]))) errors[ref] = 'Невалиден идентификатор.';
  }
  if (data.difficulty !== undefined && !P.DIFFICULTIES.includes(data.difficulty)) errors.difficulty = 'Тежината мора да биде лесна, средна или тешка.';
  if (data.date !== undefined) {
    const d = new Date(data.date);
    if (!P.DATE_RE.test(String(data.date).slice(0, 10)) || Number.isNaN(d.getTime())) errors.date = 'Невалиден датум.';
    else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today && !allowPast) errors.date = 'Датумот на турата мора да е денес или во иднина.';
      data.date = d;
    }
  }
  if (data.meetTime !== undefined && !P.TIME_RE.test(String(data.meetTime))) errors.meetTime = 'Часот мора да биде во формат ЧЧ:ММ.';
  if (data.meetPlace !== undefined) data.meetPlace = String(data.meetPlace).trim().slice(0, 80);
  for (const f of ['lengthKm', 'ascentM', 'durationH', 'capacity', 'price']) if (data[f] !== undefined) data[f] = toNumber(data[f]);
  checkRange(errors, data, 'lengthKm', 'Должината', 1, 60, false);
  checkRange(errors, data, 'ascentM', 'Искачувањето', 0, 3000);
  checkRange(errors, data, 'durationH', 'Времетраењето', 1, 24, false);
  checkRange(errors, data, 'capacity', 'Бројот на учесници', 2, 60);
  checkRange(errors, data, 'price', 'Цената', 0, 20000);
  if (data.description !== undefined && String(data.description).length > 1500) errors.description = 'Описот е подолг од 1500 знаци.';
  if (data.equipment !== undefined) {
    if (!Array.isArray(data.equipment) || !data.equipment.every((id) => P.OBJECT_ID_RE.test(String(id)))) errors.equipment = 'Невалидна листа на опрема.';
  }
  if (data.cover !== undefined && !P.COVERS.includes(data.cover)) errors.cover = 'Невалидна насловна слика.';
  if (data.gallery !== undefined && (!Array.isArray(data.gallery) || !data.gallery.every((g) => P.COVERS.includes(g)))) errors.gallery = 'Невалидна галерија.';
  fail(errors);
  return data;
}

function validateComment(body) {
  const errors = {};
  const text = String(body.text || '').trim();
  if (text.length < 2 || text.length > 500) errors.text = 'Коментарот мора да има 2–500 знаци.';
  let rating = null;
  if (!isEmpty(body.rating)) {
    rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = 'Оцената е цел број од 1 до 5.';
  }
  if (!isEmpty(body.parent) && !P.OBJECT_ID_RE.test(String(body.parent))) errors.parent = 'Невалиден коментар.';
  fail(errors);
  return { text, rating, parent: body.parent || null };
}

function validateObjectId(id, label = 'идентификатор') {
  if (!P.OBJECT_ID_RE.test(String(id))) throw new HttpError(400, `Невалиден ${label}.`);
}

module.exports = { validateRegister, validateLogin, validateTour, validateComment, validateObjectId, fail, isEmpty };
