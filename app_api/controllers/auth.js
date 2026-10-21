const mongoose = require('mongoose');
const { asyncH, HttpError } = require('../utils/errors');
const { validateRegister, validateLogin } = require('../utils/validation');
const { sendMail } = require('../utils/mailer');
const { logActivity } = require('../utils/activityLog');

const User = mongoose.model('User');

const register = asyncH(async (req, res) => {
  const data = validateRegister(req.body);
  if (await User.exists({ email: data.email })) {
    throw new HttpError(409, 'Веќе постои корисник со оваа е-пошта.', { email: 'Е-поштата е зафатена.' });
  }
  const user = new User({ name: data.name, email: data.email, phone: data.phone, experience: data.experience });
  await user.setPassword(data.password);
  await user.save();

  await logActivity(user, 'registracija', `${user.name} креираше профил.`);
  sendMail(user.email, 'Добредојдовте во ВрвТура',
    `Здраво ${user.name},\n\nВашиот профил е успешно креиран. Сега можете да се пријавувате на тури, да коментирате и да ја следите прогнозата за врвовите.`);

  res.status(201).json({ token: user.generateJwt() });
});

const login = asyncH(async (req, res) => {
  const { email, password } = validateLogin(req.body);
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.checkPassword(password))) {
    throw new HttpError(401, 'Погрешна е-пошта или лозинка.');
  }
  await logActivity(user, 'najava', `${user.name} се најави.`);
  res.status(200).json({ token: user.generateJwt() });
});

module.exports = { register, login };
