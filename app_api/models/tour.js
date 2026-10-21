const mongoose = require('mongoose');
const P = require('../utils/patterns');

// Тура – зависна од Location (врв) и User (водич)
const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Називот е задолжителен.'],
      trim: true,
      match: [P.TITLE_RE, 'Називот мора да има 5–80 знаци (букви, бројки и интерпункција).'],
    },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: [true, 'Врвот е задолжителен.'] },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Водичот е задолжителен.'] },
    difficulty: {
      type: String,
      required: true,
      enum: { values: P.DIFFICULTIES, message: 'Тежината мора да биде лесна, средна или тешка.' },
    },
    date: { type: Date, required: [true, 'Датумот е задолжителен.'] },
    meetTime: { type: String, required: true, match: [P.TIME_RE, 'Часот мора да биде во формат ЧЧ:ММ.'] },
    meetPlace: { type: String, trim: true, maxlength: 80, default: '' },
    lengthKm: { type: Number, required: true, min: [1, 'Најмалку 1 км.'], max: [60, 'Најмногу 60 км.'] },
    ascentM: { type: Number, required: true, min: [0, 'Најмалку 0 м.'], max: [3000, 'Најмногу 3000 м.'] },
    durationH: { type: Number, required: true, min: [1, 'Најмалку 1 час.'], max: [24, 'Најмногу 24 часа.'] },
    capacity: { type: Number, required: true, min: [2, 'Најмалку 2 учесници.'], max: [60, 'Најмногу 60 учесници.'] },
    price: { type: Number, required: true, min: [0, 'Цената не смее да е негативна.'], max: [20000, 'Најмногу 20000 ден.'] },
    description: { type: String, maxlength: [1500, 'Описот е подолг од 1500 знаци.'], default: '' },
    equipment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }],
    cover: { type: String, enum: P.COVERS, default: 'g1' },
    gallery: [{ type: String, enum: P.COVERS }],
  },
  { timestamps: true },
);

tourSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model('Tour', tourSchema, 'tours');
