const mongoose = require('mongoose');
const P = require('../utils/patterns');
const { asyncH, HttpError } = require('../utils/errors');
const { validateTour, validateObjectId } = require('../utils/validation');
const { sendMail } = require('../utils/mailer');
const { logActivity } = require('../utils/activityLog');

const Tour = mongoose.model('Tour');
const Location = mongoose.model('Location');
const User = mongoose.model('User');
const Equipment = mongoose.model('Equipment');
const Registration = mongoose.model('Registration');
const Comment = mongoose.model('Comment');
const Activity = mongoose.model('Activity');

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const DIFF_ORDER = { lesna: 1, sredna: 2, teshka: 3 };

/** Ги додава бројот на пријавени (потврдени и на чекање) и просечната оцена на секоја тура. */
async function withCounts(tours) {
  const ids = tours.map((t) => t._id);
  const [regs, ratings] = await Promise.all([
    Registration.aggregate([
      { $match: { tour: { $in: ids } } },
      { $group: { _id: { tour: '$tour', status: '$status' }, n: { $sum: 1 } } },
    ]),
    Comment.aggregate([
      { $match: { tour: { $in: ids }, rating: { $ne: null } } },
      { $group: { _id: '$tour', avg: { $avg: '$rating' }, n: { $sum: 1 } } },
    ]),
  ]);
  return tours.map((t) => {
    const obj = t.toJSON();
    const id = String(t._id);
    obj.registeredCount = regs.find((r) => String(r._id.tour) === id && r._id.status === 'potvrdena')?.n || 0;
    obj.waitingCount = regs.find((r) => String(r._id.tour) === id && r._id.status === 'cekanje')?.n || 0;
    const rt = ratings.find((r) => String(r._id) === id);
    obj.avgRating = rt ? Math.round(rt.avg * 10) / 10 : null;
    obj.ratingCount = rt ? rt.n : 0;
    return obj;
  });
}

const list = asyncH(async (req, res) => {
  const { q, difficulty, region, from, to, maxLength, available, period = 'upcoming', sort = 'date' } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 9));
  const and = [];

  if (period === 'upcoming') and.push({ date: { $gte: startOfToday() } });
  else if (period === 'past') and.push({ date: { $lt: startOfToday() } });
  else if (period !== 'all') throw new HttpError(400, 'period мора да биде upcoming, past или all.');

  if (q) {
    const term = String(q).trim().slice(0, 50);
    const re = new RegExp(escapeRe(term), 'i');
    const locIds = await Location.find({ name: re }).distinct('_id');
    and.push({ $or: [{ title: re }, { description: re }, { location: { $in: locIds } }] });
  }
  if (difficulty) {
    const values = String(difficulty).split(',').filter(Boolean);
    if (!values.every((d) => P.DIFFICULTIES.includes(d))) throw new HttpError(400, 'Непозната тежина.');
    and.push({ difficulty: { $in: values } });
  }
  if (region) {
    if (!P.REGIONS.includes(region)) throw new HttpError(400, 'Непознат регион.');
    const locIds = await Location.find({ region }).distinct('_id');
    and.push({ location: { $in: locIds } });
  }
  if (from || to) {
    const range = {};
    if (from) range.$gte = new Date(from);
    if (to) { const t = new Date(to); t.setHours(23, 59, 59, 999); range.$lte = t; }
    if (Object.values(range).some((d) => Number.isNaN(d.getTime()))) throw new HttpError(400, 'Невалиден датум во филтерот.');
    and.push({ date: range });
  }
  if (maxLength) {
    const n = Number(maxLength);
    if (!Number.isFinite(n) || n <= 0) throw new HttpError(400, 'maxLength мора да е позитивен број.');
    and.push({ lengthKm: { $lte: n } });
  }

  const docs = await Tour.find(and.length ? { $and: and } : {}).populate('location', 'name region elevation icon lat lon');
  let items = await withCounts(docs);
  if (available === 'true') items = items.filter((t) => t.registeredCount < t.capacity);

  const sorters = {
    date: (a, b) => (period === 'past' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)),
    difficulty: (a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty] || new Date(a.date) - new Date(b.date),
    free: (a, b) => (b.capacity - b.registeredCount) - (a.capacity - a.registeredCount),
  };
  if (!sorters[sort]) throw new HttpError(400, 'sort мора да биде date, difficulty или free.');
  items.sort(sorters[sort]);

  const total = items.length;
  res.status(200).json({
    items: items.slice((page - 1) * limit, page * limit),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});

const getOne = asyncH(async (req, res) => {
  validateObjectId(req.params.id, 'идентификатор на тура');
  const tour = await Tour.findById(req.params.id)
    .populate('location')
    .populate('guide', 'name email')
    .populate('equipment');
  if (!tour) throw new HttpError(404, 'Турата не е пронајдена.');
  const [item] = await withCounts([tour]);
  res.status(200).json(item);
});

async function checkRefs(data) {
  if (data.location && !(await Location.exists({ _id: data.location }))) throw new HttpError(400, 'Врвот не постои.', { location: 'Врвот не постои.' });
  if (data.guide) {
    const g = await User.findById(data.guide);
    if (!g || g.role !== 'admin') throw new HttpError(400, 'Водичот мора да биде администратор.', { guide: 'Невалиден водич.' });
  }
  if (data.equipment && data.equipment.length) {
    const n = await Equipment.countDocuments({ _id: { $in: data.equipment } });
    if (n !== data.equipment.length) throw new HttpError(400, 'Дел од опремата не постои.', { equipment: 'Невалидна опрема.' });
  }
}

const create = asyncH(async (req, res) => {
  const data = validateTour(req.body);
  if (!data.guide) data.guide = req.auth._id;
  await checkRefs(data);
  const tour = await Tour.create(data);

  await logActivity(req.auth, 'tura_kreirana', `${req.auth.name} ја креираше турата „${tour.title}“.`, tour);
  if (req.body.notify === true) {
    const subs = await User.find({ notifyNewTours: true, _id: { $ne: req.auth._id } }).distinct('email');
    const loc = await Location.findById(tour.location);
    sendMail(subs, `Нова тура: ${tour.title}`,
      `Објавена е нова тура „${tour.title}“ (${loc ? loc.name : ''}) на ${tour.date.toLocaleDateString('mk-MK')}.\nПријавете се на ВрвТура додека има слободни места.`);
  }
  res.status(201).json(tour);
});

const LABELS = { title: 'назив', location: 'врв', guide: 'водич', difficulty: 'тежина', date: 'датум', meetTime: 'час', meetPlace: 'место на средба',
  lengthKm: 'должина', ascentM: 'искачување', durationH: 'времетраење', capacity: 'места', price: 'цена', description: 'опис',
  equipment: 'опрема', cover: 'насловна слика', gallery: 'галерија' };

const fmt = (v) => {
  if (v instanceof Date) return v.toLocaleDateString('mk-MK');
  if (Array.isArray(v)) return `${v.length} ставки`;
  if (v && typeof v === 'object' && v._bsontype) return String(v);
  return String(v ?? '');
};

const update = asyncH(async (req, res) => {
  validateObjectId(req.params.id, 'идентификатор на тура');
  const data = validateTour(req.body, { partial: true, allowPast: true });
  await checkRefs(data);
  const tour = await Tour.findById(req.params.id);
  if (!tour) throw new HttpError(404, 'Турата не е пронајдена.');
  // Датумот смее да остане ист (и за минати тури), но нов датум мора да е во иднина
  if (data.date && data.date.getTime() !== tour.date.getTime() && data.date < startOfToday()) {
    throw new HttpError(400, 'Невалидни податоци.', { date: 'Новиот датум мора да е денес или во иднина.' });
  }

  const changes = [];
  for (const [field, value] of Object.entries(data)) {
    const before = tour[field];
    const same = Array.isArray(value)
      ? JSON.stringify((before || []).map(String)) === JSON.stringify(value.map(String))
      : fmt(before) === fmt(value);
    if (!same && field !== 'description') changes.push(`${LABELS[field]}: ${fmt(before)} → ${fmt(value)}`);
    else if (!same) changes.push('изменет опис');
    tour.set(field, value);
  }
  await tour.save();

  if (changes.length) {
    await logActivity(req.auth, 'tura_izmeneta', `${req.auth.name} ја измени турата (${changes.join('; ')}).`, tour);
    if (req.body.notify === true) {
      const regs = await Registration.find({ tour: tour._id }).populate('user', 'email');
      sendMail(regs.map((r) => r.user && r.user.email), `Променети детали: ${tour.title}`,
        `Турата „${tour.title}“ на која сте пријавени е изменета:\n- ${changes.join('\n- ')}`);
    }
  }
  res.status(200).json(tour);
});

const remove = asyncH(async (req, res) => {
  validateObjectId(req.params.id, 'идентификатор на тура');
  const tour = await Tour.findById(req.params.id);
  if (!tour) throw new HttpError(404, 'Турата не е пронајдена.');
  const reasonKey = P.DELETE_REASONS[req.body?.reason] ? req.body.reason : 'drugo';
  const message = String(req.body?.message || '').slice(0, 500);

  const regs = await Registration.find({ tour: tour._id }).populate('user', 'email');
  const emails = regs.map((r) => r.user && r.user.email);
  const [r, c] = await Promise.all([
    Registration.deleteMany({ tour: tour._id }),
    Comment.deleteMany({ tour: tour._id }),
  ]);
  await tour.deleteOne();

  sendMail(emails, `Откажана тура: ${tour.title}`,
    `Турата „${tour.title}“ (${tour.date.toLocaleDateString('mk-MK')}) е откажана.\nПричина: ${P.DELETE_REASONS[reasonKey]}.\n${message}`);
  await logActivity(req.auth, 'tura_izbrishana',
    `${req.auth.name} ја избриша турата „${tour.title}“ (${P.DELETE_REASONS[reasonKey]}). Избришани ${r.deletedCount} пријави и ${c.deletedCount} коментари.`, tour);

  res.status(204).send();
});

const history = asyncH(async (req, res) => {
  validateObjectId(req.params.id, 'идентификатор на тура');
  const items = await Activity.find({ tour: req.params.id }).sort({ createdAt: -1 }).limit(50);
  res.status(200).json(items);
});

module.exports = { list, getOne, create, update, remove, history, withCounts };
