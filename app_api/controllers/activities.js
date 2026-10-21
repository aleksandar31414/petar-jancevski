const mongoose = require('mongoose');
const { asyncH } = require('../utils/errors');

const Activity = mongoose.model('Activity');

const mine = asyncH(async (req, res) => {
  res.status(200).json(await Activity.find({ user: req.auth._id }).sort({ createdAt: -1 }).limit(30));
});

const all = asyncH(async (req, res) => {
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 30));
  res.status(200).json(await Activity.find().sort({ createdAt: -1 }).limit(limit));
});

module.exports = { mine, all };
