const mongoose = require('mongoose');
const { asyncH } = require('../utils/errors');
const seed = require('../seed/data');

const User = mongoose.model('User');
const Location = mongoose.model('Location');
const Equipment = mongoose.model('Equipment');
const Tour = mongoose.model('Tour');
const Registration = mongoose.model('Registration');
const Comment = mongoose.model('Comment');
const Activity = mongoose.model('Activity');

const MODELS = { users: User, locations: Location, equipment: Equipment, tours: Tour, registrations: Registration, comments: Comment, activities: Activity };

async function wipe() {
  const result = {};
  for (const [name, Model] of Object.entries(MODELS)) {
    // eslint-disable-next-line no-await-in-loop
    result[name] = (await Model.deleteMany({})).deletedCount;
  }
  return result;
}

/** DELETE /db – брише ги сите податоци. */
const deleteAll = asyncH(async (req, res) => {
  const deleted = await wipe();
  res.status(200).json({ message: 'Сите податоци се избришани.', deleted });
});

/** POST /db/seed – ја празни базата и внесува иницијални податоци. */
const seedAll = asyncH(async (req, res) => {
  await wipe();
  const id = {};
  const save = (key, doc) => { id[key] = doc._id; };

  for (const l of seed.locations) save(`loc:${l.key}`, await Location.create({ ...l, key: undefined }));
  for (const e of seed.equipment) save(`eq:${e.key}`, await Equipment.create({ name: e.name, category: e.category }));
  for (const u of seed.users) {
    const user = new User({
      name: u.name, email: u.email, role: u.role, experience: u.experience, phone: u.phone,
      equipmentList: (u.equipment || []).map((k) => id[`eq:${k}`]),
    });
    await user.setPassword(u.password);
    save(`user:${u.key}`, await user.save());
  }
  const tourDocs = {};
  for (const t of seed.tours) {
    const doc = await Tour.create({
      ...t,
      key: undefined,
      location: id[`loc:${t.location}`],
      guide: id[`user:${t.guide}`],
      equipment: t.equipment.map((k) => id[`eq:${k}`]),
    });
    tourDocs[t.key] = doc;
    save(`tour:${t.key}`, doc);
  }
  const userNames = Object.fromEntries(seed.users.map((u) => [u.key, u.name]));

  const regs = seed.registrations.map((r, i) => {
    const tour = tourDocs[r.tour];
    // Пријавата е направена неколку дена пред турата
    const created = new Date(Math.min(Date.now(), tour.date.getTime()) - (7 + (i % 5)) * 86400000);
    return { user: id[`user:${r.user}`], tour: tour._id, status: r.status || 'potvrdena', needsTransport: !!r.needsTransport, createdAt: created };
  });
  await Registration.insertMany(regs);

  for (const c of seed.comments) {
    const doc = await Comment.create({
      user: id[`user:${c.user}`], tour: id[`tour:${c.tour}`], text: c.text,
      rating: c.rating || null, parent: c.parent ? id[`com:${c.parent}`] : null,
      createdAt: new Date(Date.now() - (c.parent ? 1 : 2) * 86400000),
    });
    save(`com:${c.key}`, doc);
  }

  const activities = [];
  seed.users.forEach((u, i) => activities.push({ user: id[`user:${u.key}`], userName: u.name, action: 'registracija', message: `${u.name} креираше профил.`, createdAt: new Date(Date.now() - (200 - i) * 86400000) }));
  seed.tours.forEach((t, i) => activities.push({ user: id[`user:${t.guide}`], userName: userNames[t.guide], tour: id[`tour:${t.key}`], tourTitle: t.title, action: 'tura_kreirana', message: `${userNames[t.guide]} ја креираше турата „${t.title}“.`, createdAt: new Date(Math.min(Date.now(), tourDocs[t.key].date.getTime()) - (20 + i) * 86400000) }));
  regs.forEach((r, i) => {
    const s = seed.registrations[i];
    activities.push({ user: r.user, userName: userNames[s.user], tour: r.tour, tourTitle: tourDocs[s.tour].title, action: 'prijava_tura', message: `${userNames[s.user]} се пријави на „${tourDocs[s.tour].title}“${r.status === 'cekanje' ? ' (листа на чекање)' : ''}.`, createdAt: r.createdAt });
  });
  activities.push({ user: id['user:marko'], userName: userNames.marko, tour: id['tour:pelister'], tourTitle: tourDocs.pelister.title, action: 'tura_izmeneta', message: `${userNames.marko} ја измени турата (цена: 500 → 600).`, createdAt: new Date(Date.now() - 3 * 86400000) });
  await Activity.insertMany(activities);

  const counts = {};
  for (const [name, Model] of Object.entries(MODELS)) counts[name] = await Model.countDocuments();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  res.status(201).json({ message: `Внесени се ${total} документи во ${Object.keys(counts).length} колекции.`, counts });
});

module.exports = { deleteAll, seedAll };
