const mongoose = require('mongoose');
const { asyncH, HttpError } = require('../utils/errors');
const { validateComment, validateObjectId } = require('../utils/validation');
const { isAdmin } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLog');

const Tour = mongoose.model('Tour');
const Comment = mongoose.model('Comment');

const listForTour = asyncH(async (req, res) => {
  validateObjectId(req.params.tourId, 'идентификатор на тура');
  const comments = await Comment.find({ tour: req.params.tourId }).populate('user', 'name role').sort({ createdAt: 1 });
  res.status(200).json(comments);
});

const create = asyncH(async (req, res) => {
  validateObjectId(req.params.tourId, 'идентификатор на тура');
  const data = validateComment(req.body);
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) throw new HttpError(404, 'Турата не е пронајдена.');
  if (data.parent) {
    const parent = await Comment.findById(data.parent);
    if (!parent || String(parent.tour) !== String(tour._id)) throw new HttpError(400, 'Коментарот на кој одговарате не постои.');
    if (parent.parent) data.parent = parent.parent; // само едно ниво на одговори
    data.rating = null;
  }
  const comment = await Comment.create({ ...data, tour: tour._id, user: req.auth._id });
  await comment.populate('user', 'name role');
  await logActivity(req.auth, 'komentar', `${req.auth.name} коментираше на „${tour.title}“.`, tour);
  res.status(201).json(comment);
});

const remove = asyncH(async (req, res) => {
  validateObjectId(req.params.id, 'идентификатор на коментар');
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new HttpError(404, 'Коментарот не е пронајден.');
  if (!isAdmin(req) && String(comment.user) !== String(req.auth._id)) {
    throw new HttpError(403, 'Може да бришете само свои коментари.');
  }
  await Comment.deleteMany({ $or: [{ _id: comment._id }, { parent: comment._id }] });
  res.status(204).send();
});

module.exports = { listForTour, create, remove };
