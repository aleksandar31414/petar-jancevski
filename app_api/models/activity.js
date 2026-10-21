const mongoose = require('mongoose');

const ACTIONS = [
  'registracija', 'najava', 'prijava_tura', 'otkazuvanje', 'komentar',
  'tura_kreirana', 'tura_izmeneta', 'tura_izbrishana',
  'profil_izmenet', 'korisnik_izmenet', 'korisnik_izbrishan', 'sistem',
];

// Историски преглед на активностите
const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userName: { type: String, default: 'Систем' },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', default: null },
  tourTitle: { type: String, default: '' },
  action: { type: String, enum: ACTIONS, required: true },
  message: { type: String, required: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

activitySchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model('Activity', activitySchema, 'activities');
module.exports.ACTIONS = ACTIONS;
