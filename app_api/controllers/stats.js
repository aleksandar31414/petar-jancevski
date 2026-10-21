const mongoose = require('mongoose');
const { asyncH } = require('../utils/errors');

const Tour = mongoose.model('Tour');
const User = mongoose.model('User');
const Location = mongoose.model('Location');
const Comment = mongoose.model('Comment');
const Registration = mongoose.model('Registration');

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

async function publicNumbers() {
  const [upcomingTours, users, locations, rating] = await Promise.all([
    Tour.countDocuments({ date: { $gte: startOfToday() } }),
    User.countDocuments(),
    Location.countDocuments(),
    Comment.aggregate([{ $match: { rating: { $ne: null } } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]),
  ]);
  return { upcomingTours, users, locations, avgRating: rating[0] ? Math.round(rating[0].avg * 10) / 10 : null };
}

const publicStats = asyncH(async (req, res) => {
  res.status(200).json(await publicNumbers());
});

/** Податоци за графиконите во админ таблата. */
const adminStats = asyncH(async (req, res) => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 2, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [numbers, byMonth, byDifficulty, regsThisMonth] = await Promise.all([
    publicNumbers(),
    Registration.aggregate([
      { $match: { status: 'potvrdena' } },
      { $lookup: { from: 'tours', localField: 'tour', foreignField: '_id', as: 't' } },
      { $unwind: '$t' },
      { $match: { 't.date': { $gte: from, $lt: to } } },
      { $group: { _id: { y: { $year: '$t.date' }, m: { $month: '$t.date' } }, n: { $sum: 1 } } },
    ]),
    Tour.aggregate([{ $group: { _id: '$difficulty', n: { $sum: 1 } } }]),
    Registration.countDocuments({ createdAt: { $gte: monthStart } }),
  ]);

  const months = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    const hit = byMonth.find((b) => b._id.y === d.getFullYear() && b._id.m === d.getMonth() + 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, participants: hit ? hit.n : 0 });
  }
  const diff = (k) => byDifficulty.find((b) => b._id === k)?.n || 0;

  res.status(200).json({
    ...numbers,
    registrationsThisMonth: regsThisMonth,
    participantsByMonth: months,
    toursByDifficulty: { lesna: diff('lesna'), sredna: diff('sredna'), teshka: diff('teshka') },
  });
});

module.exports = { publicStats, adminStats };
