const mongoose = require('mongoose');
const P = require('../utils/patterns');

// Врв / локација. Координатите се користат за прогнозата од Open-Meteo.
const locationSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Името на врвот е задолжително.'], trim: true, unique: true, minlength: 2, maxlength: 60 },
  region: { type: String, required: true, enum: { values: P.REGIONS, message: 'Непознат регион.' } },
  elevation: { type: Number, required: true, min: [0, 'Височината не смее да е негативна.'], max: [3000, 'Највисокиот врв во Македонија е под 3000 м.'] },
  lat: { type: Number, required: true, min: -90, max: 90 },
  lon: { type: Number, required: true, min: -180, max: 180 },
  icon: { type: String, enum: P.ICONS, default: 'triangle' },
  description: { type: String, maxlength: 500, default: '' },
});

locationSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model('Location', locationSchema, 'locations');
