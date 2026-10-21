const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const P = require('../utils/patterns');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Името е задолжително.'],
    trim: true,
    match: [P.NAME_RE, 'Името смее да содржи само букви (2–50 знаци).'],
  },
  email: {
    type: String,
    required: [true, 'Е-поштата е задолжителна.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [P.EMAIL_RE, 'Невалидна е-пошта.'],
  },
  phone: {
    type: String,
    trim: true,
    match: [P.PHONE_RE, 'Телефонот мора да биде во формат 070 123 456.'],
  },
  passwordHash: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: { values: P.ROLES, message: 'Улогата мора да биде user или admin.' },
    default: 'user',
  },
  experience: {
    type: String,
    enum: { values: P.EXPERIENCE, message: 'Невалидно ниво на искуство.' },
    default: 'pocetnik',
  },
  notifyNewTours: { type: Boolean, default: true },
  // Лична листа за опрема – редоследот се менува со влечење и спуштање
  equipmentList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }],
  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

userSchema.methods.checkPassword = function checkPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.generateJwt = function generateJwt() {
  return jwt.sign(
    { _id: this._id, name: this.name, email: this.email, role: this.role },
    process.env.JWT_SECRET || 'razvoen-kluch-ne-za-produkcija',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema, 'users');
