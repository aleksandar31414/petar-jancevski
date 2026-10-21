const mongoose = require('mongoose');
const P = require('../utils/patterns');
const { asyncH, HttpError } = require('../utils/errors');
const { validateObjectId, fail } = require('../utils/validation');

const Equipment = mongoose.model('Equipment');
const Tour = mongoose.model('Tour');
const User = mongoose.model('User');

const list = asyncH(async (req, res) => {
  res.status(200).json(await Equipment.find().sort({ category: 1, name: 1 }));
});

const create = asyncH(async (req, res) => {
  const errors = {};
  const name = String(req.body.name || '').trim();
  if (!/^[\p{L}\p{N}][\p{L}\p{N} ,.()-]{1,39}$/u.test(name)) errors.name = 'Името мора да има 2–40 знаци.';
  if (!P.EQUIP_CATEGORIES.includes(req.body.category)) errors.category = 'Непозната категорија.';
  fail(errors);
  res.status(201).json(await Equipment.create({ name, category: req.body.category }));
});

const remove = asyncH(async (req, res) => {
  validateObjectId(req.params.id, 'идентификатор на опрема');
  const eq = await Equipment.findByIdAndDelete(req.params.id);
  if (!eq) throw new HttpError(404, 'Опремата не е пронајдена.');
  await Promise.all([
    Tour.updateMany({}, { $pull: { equipment: eq._id } }),
    User.updateMany({}, { $pull: { equipmentList: eq._id } }),
  ]);
  res.status(204).send();
});

module.exports = { list, create, remove };
