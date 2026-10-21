const mongoose = require('mongoose');

// Коментар и оцена – зависен од User и Tour (одговорите имаат parent)
const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  text: {
    type: String,
    required: [true, 'Коментарот не смее да е празен.'],
    trim: true,
    minlength: [2, 'Коментарот мора да има најмалку 2 знаци.'],
    maxlength: [500, 'Коментарот смее да има најмногу 500 знаци.'],
  },
  rating: { type: Number, min: [1, 'Оцената е од 1 до 5.'], max: [5, 'Оцената е од 1 до 5.'], default: null },
  createdAt: { type: Date, default: Date.now },
});

commentSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model('Comment', commentSchema, 'comments');
