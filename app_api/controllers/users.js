const mongoose = require('mongoose');
const P = require('../utils/patterns');
const { asyncH, HttpError } = require('../utils/errors');
const { validateObjectId, fail } = require('../utils/validation');
const { logActivity } = require('../utils/activityLog');

const User = mongoose.model('User');
const Equipment = mongoose.model('Equipment');
const Registration = mongoose.model('Registration');
const Comment = mongoose.model('Comment');
const Tour = mongoose.model('Tour');

/** Заеднички проверки за полињата што корисникот смее да ги менува. */
function validateProfile(body, { allowRole }) {
  const errors = {};
  const data = {};
  if (body.name !== undefined) {
    data.name = String(body.name).trim();
    if (!P.NAME_RE.test(data.name)) errors.name = 'Името смее да содржи само букви (2–50 знаци).';
  }
  if (body.phone !== undefined) {
    data.phone = String(body.phone).trim();
    if (data.phone && !P.PHONE_RE.test(data.phone)) errors.phone = 'Телефонот мора да биде во формат 070 123 456.';
    if (!data.phone) data.phone = undefined;
  }
  if (body.experience !== undefined) {
    if (!P.EXPERIENCE.includes(body.experience)) errors.experience = 'Невалидно ниво на искуство.';
    data.experience = body.experience;
  }
  if (body.notifyNewTours !== undefined) data.notifyNewTours = body.notifyNewTours === true;
  if (body.role !== undefined) {
    if (!allowRole) errors.role = 'Немате право да ја менувате улогата.';
    else if (!P.ROLES.includes(body.role)) errors.role = 'Улогата мора да биде user или admin.';
    data.role = body.role;
  }
  if (body.password !== undefined && body.password !== '') {
    if (!P.PASSWORD_RE.test(String(body.password))) errors.password = 'Лозинката мора да има 8–64 знаци, барем една буква и една бројка.';
    data.password = String(body.password);
  }
  fail(errors);
  return data;
}

async function applyProfile(user, data) {
  const { password, ...rest } = data;
  for (const [k, v] of Object.entries(rest)) user.set(k, v);
  if (password) await user.setPassword(password);
  await user.save();
  return user;
}

const me = asyncH(async (req, res) => {
  const user = await User.findById(req.auth._id).populate('equipmentList');
  if (!user) throw new HttpError(404, 'Корисникот не постои.');
  const [tours, km] = await Promise.all([
    Registration.countDocuments({ user: user._id, status: 'potvrdena' }),
    Registration.aggregate([
      { $match: { user: user._id, status: 'potvrdena' } },
      { $lookup: { from: 'tours', localField: 'tour', foreignField: '_id', as: 't' } },
      { $unwind: '$t' },
      { $match: { 't.date': { $lt: new Date() } } },
      { $group: { _id: null, km: { $sum: '$t.lengthKm' }, peaks: { $addToSet: '$t.location' }, n: { $sum: 1 } } },
    ]),
  ]);
  res.status(200).json({
    ...user.toJSON(),
    stats: { registrations: tours, completed: km[0]?.n || 0, km: km[0]?.km || 0, peaks: km[0]?.peaks.length || 0 },
  });
});

const updateMe = asyncH(async (req, res) => {
  const data = validateProfile(req.body, { allowRole: false });
  const user = await User.findById(req.auth._id).select('+passwordHash');
  if (!user) throw new HttpError(404, 'Корисникот не постои.');
  await applyProfile(user, data);
  await logActivity(req.auth, 'profil_izmenet', `${user.name} го измени својот профил.`);
  res.status(200).json({ user, token: user.generateJwt() });
});

/** PUT /users/me/equipment – редослед на личната листа за опрема (drag & drop). */
const updateMyEquipment = asyncH(async (req, res) => {
  const ids = req.body.equipment;
  if (!Array.isArray(ids) || ids.length > 50 || !ids.every((id) => P.OBJECT_ID_RE.test(String(id)))) {
    throw new HttpError(400, 'equipment мора да е листа од најмногу 50 идентификатори.');
  }
  if (new Set(ids.map(String)).size !== ids.length) throw new HttpError(400, 'Опремата не смее да се повторува.');
  const n = await Equipment.countDocuments({ _id: { $in: ids } });
  if (n !== ids.length) throw new HttpError(400, 'Дел од опремата не постои.');
  const user = await User.findByIdAndUpdate(req.auth._id, { equipmentList: ids }, { new: true }).populate('equipmentList');
  res.status(200).json(user.equipmentList);
});

const list = asyncH(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  const counts = await Registration.aggregate([{ $group: { _id: '$user', n: { $sum: 1 } } }]);
  res.status(200).json(users.map((u) => ({
    ...u.toJSON(),
    registrationCount: counts.find((c) => String(c._id) === String(u._id))?.n || 0,
  })));
});

const update = asyncH(async (req, res) => {
  validateObjectId(req.params.id, 'идентификатор на корисник');
  const data = validateProfile(req.body, { allowRole: true });
  if (String(req.params.id) === String(req.auth._id) && data.role && data.role !== 'admin') {
    throw new HttpError(400, 'Не можете самите да си ја одземете администраторската улога.');
  }
  const user = await User.findById(req.params.id).select('+passwordHash');
  if (!user) throw new HttpError(404, 'Корисникот не постои.');
  await applyProfile(user, data);
  await logActivity(req.auth, 'korisnik_izmenet', `${req.auth.name} го измени корисникот ${user.name}${data.role ? ` (улога: ${data.role})` : ''}.`);
  res.status(200).json(user);
});

const remove = asyncH(async (req, res) => {
  validateObjectId(req.params.id, 'идентификатор на корисник');
  if (String(req.params.id) === String(req.auth._id)) throw new HttpError(400, 'Не можете да го избришете сопствениот профил.');
  if (await Tour.exists({ guide: req.params.id })) throw new HttpError(409, 'Корисникот е водич на тури – прво сменете го водичот.');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new HttpError(404, 'Корисникот не постои.');
  await Promise.all([Registration.deleteMany({ user: user._id }), Comment.deleteMany({ user: user._id })]);
  await logActivity(req.auth, 'korisnik_izbrishan', `${req.auth.name} го избриша корисникот ${user.name}.`);
  res.status(204).send();
});

/** GET /users/guides – администраторите кои може да бидат водичи (за формата за тура). */
const guides = asyncH(async (req, res) => {
  res.status(200).json(await User.find({ role: 'admin' }).select('name').sort({ name: 1 }));
});

module.exports = { me, updateMe, updateMyEquipment, list, update, remove, guides };
