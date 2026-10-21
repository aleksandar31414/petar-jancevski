const mongoose = require('mongoose');
const P = require('../utils/patterns');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Името на опремата е задолжително.'], trim: true, unique: true, minlength: 2, maxlength: 40 },
  category: { type: String, required: true, enum: { values: P.EQUIP_CATEGORIES, message: 'Непозната категорија.' } },
});

equipmentSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model('Equipment', equipmentSchema, 'equipment');
