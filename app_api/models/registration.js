const mongoose = require('mongoose');
const P = require('../utils/patterns');

// Пријава на тура – зависна од User и Tour
const registrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  status: { type: String, enum: { values: P.REG_STATUS, message: 'Невалиден статус.' }, default: 'potvrdena' },
  needsTransport: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Еден корисник може само еднаш да се пријави на иста тура
registrationSchema.index({ user: 1, tour: 1 }, { unique: true });
registrationSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model('Registration', registrationSchema, 'registrations');
