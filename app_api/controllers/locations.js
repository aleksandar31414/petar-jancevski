const mongoose = require('mongoose');
const P = require('../utils/patterns');
const { asyncH, HttpError } = require('../utils/errors');
const { validateObjectId, fail } = require('../utils/validation');

const Location = mongoose.model('Location');
const Tour = mongoose.model('Tour');

function validateLocation(body, partial) {
  const errors = {};
  const data = {};
  for (const f of ['name', 'region', 'elevation', 'lat', 'lon', 'icon', 'description']) if (body[f] !== undefined) data[f] = body[f];
  if (!partial) for (const f of ['name', 'region', 'elevation', 'lat', 'lon']) if (data[f] === undefined || data[f] === '') errors[f] = 'Полето е задолжително.';
  if (data.name !== undefined && !/^[\p{L}\p{N}][\p{L}\p{N} ().-]{1,59}$/u.test(String(data.name).trim())) errors.name = 'Невалидно име (2–60 знаци).';
  if (data.region !== undefined && !P.REGIONS.includes(data.region)) errors.region = 'Непознат регион.';
  for (const [f, min, max] of [['elevation', 0, 3000], ['lat', 40.8, 42.4], ['lon', 20.4, 23.1]]) {
    if (data[f] === undefined) continue;
    data[f] = Number(data[f]);
    if (!Number.isFinite(data[f]) || data[f] < min || data[f] > max) errors[f] = `Вредноста мора да е меѓу ${min} и ${max}.`;
  }
  if (data.icon !== undefined && !P.ICONS.includes(data.icon)) errors.icon = 'Непозната икона.';
  fail(errors);
  return data;
}

const list = asyncH(async (req, res) => {
  res.status(200).json(await Location.find().sort({ name: 1 }));
});

const getOne = asyncH(async (req, res) => {
  validateObjectId(req.params.id, 'идентификатор на врв');
  const loc = await Location.findById(req.params.id);
  if (!loc) throw new HttpError(404, 'Врвот не е пронајден.');
  res.status(200).json(loc);
});

const create = asyncH(async (req, res) => {
  res.status(201).json(await Location.create(validateLocation(req.body, false)));
});

const update = asyncH(async (req, res) => {
  validateObjectId(req.params.id, 'идентификатор на врв');
  const loc = await Location.findByIdAndUpdate(req.params.id, validateLocation(req.body, true), { new: true, runValidators: true });
  if (!loc) throw new HttpError(404, 'Врвот не е пронајден.');
  res.status(200).json(loc);
});

const remove = asyncH(async (req, res) => {
  validateObjectId(req.params.id, 'идентификатор на врв');
  if (await Tour.exists({ location: req.params.id })) {
    throw new HttpError(409, 'Врвот не може да се избрише бидејќи има тури поврзани со него.');
  }
  const loc = await Location.findByIdAndDelete(req.params.id);
  if (!loc) throw new HttpError(404, 'Врвот не е пронајден.');
  res.status(204).send();
});

module.exports = { list, getOne, create, update, remove };
