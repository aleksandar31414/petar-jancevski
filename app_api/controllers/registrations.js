const mongoose = require('mongoose');
const { asyncH, HttpError } = require('../utils/errors');
const { validateObjectId } = require('../utils/validation');
const { isAdmin } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');
const { logActivity } = require('../utils/activityLog');

const Tour = mongoose.model('Tour');
const User = mongoose.model('User');
const Registration = mongoose.model('Registration');

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

const create = asyncH(async (req, res) => {
  validateObjectId(req.params.tourId, 'идентификатор на тура');
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) throw new HttpError(404, 'Турата не е пронајдена.');
  if (tour.date < startOfToday()) throw new HttpError(400, 'Не може да се пријавите на тура што веќе помина.');
  if (await Registration.exists({ tour: tour._id, user: req.auth._id })) {
    throw new HttpError(409, 'Веќе сте пријавени на оваа тура.');
  }
  const confirmed = await Registration.countDocuments({ tour: tour._id, status: 'potvrdena' });
  const status = confirmed < tour.capacity ? 'potvrdena' : 'cekanje';
  const reg = await Registration.create({
    tour: tour._id,
    user: req.auth._id,
    status,
    needsTransport: req.body?.needsTransport === true,
  });

  const user = await User.findById(req.auth._id);
  const statusText = status === 'potvrdena' ? 'Пријавата е потврдена.' : 'Турата е полна – ставени сте на листа на чекање.';
  sendMail(user.email, `Пријава: ${tour.title}`,
    `Здраво ${user.name},\n\n${statusText}\nТура: ${tour.title}\nДатум: ${tour.date.toLocaleDateString('mk-MK')} во ${tour.meetTime}`);
  await logActivity(req.auth, 'prijava_tura',
    `${req.auth.name} се пријави на „${tour.title}“${status === 'cekanje' ? ' (листа на чекање)' : ''}.`, tour);

  res.status(201).json(reg);
});

const mine = asyncH(async (req, res) => {
  const regs = await Registration.find({ user: req.auth._id })
    .populate({ path: 'tour', populate: { path: 'location', select: 'name lat lon elevation icon region' } })
    .sort({ createdAt: -1 });
  res.status(200).json(regs.filter((r) => r.tour));
});

const listForTour = asyncH(async (req, res) => {
  validateObjectId(req.params.tourId, 'идентификатор на тура');
  const regs = await Registration.find({ tour: req.params.tourId })
    .populate('user', 'name email phone experience')
    .sort({ status: -1, createdAt: 1 });
  res.status(200).json(regs);
});

const remove = asyncH(async (req, res) => {
  validateObjectId(req.params.id, 'идентификатор на пријава');
  const reg = await Registration.findById(req.params.id).populate('tour');
  if (!reg) throw new HttpError(404, 'Пријавата не е пронајдена.');
  if (!isAdmin(req) && String(reg.user) !== String(req.auth._id)) {
    throw new HttpError(403, 'Може да откажете само своја пријава.');
  }
  const wasConfirmed = reg.status === 'potvrdena';
  await reg.deleteOne();

  // Првиот на листата на чекање добива место
  if (wasConfirmed && reg.tour) {
    const next = await Registration.findOne({ tour: reg.tour._id, status: 'cekanje' }).sort({ createdAt: 1 }).populate('user', 'email name');
    if (next) {
      next.status = 'potvrdena';
      await next.save();
      sendMail(next.user.email, `Се ослободи место: ${reg.tour.title}`,
        `Здраво ${next.user.name},\n\nСе ослободи место и вашата пријава за „${reg.tour.title}“ е потврдена.`);
    }
  }
  if (reg.tour) await logActivity(req.auth, 'otkazuvanje', `${req.auth.name} ја откажа пријавата за „${reg.tour.title}“.`, reg.tour);
  res.status(204).send();
});

module.exports = { create, mine, listForTour, remove };
