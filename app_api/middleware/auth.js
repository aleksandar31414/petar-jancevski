const jwt = require('jsonwebtoken');

const secret = () => process.env.JWT_SECRET || 'razvoen-kluch-ne-za-produkcija';

function readToken(req) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return { status: 'none' };
  try {
    return { status: 'ok', payload: jwt.verify(token, secret()) };
  } catch (e) {
    return { status: 'invalid' };
  }
}

/** Ако има валиден токен, го поставува req.auth; гостите продолжуваат без него. */
function optionalAuth(req, res, next) {
  const t = readToken(req);
  if (t.status === 'ok') req.auth = t.payload;
  next();
}

/** Само за најавени корисници (регистриран корисник или администратор). */
function requireAuth(req, res, next) {
  const t = readToken(req);
  if (t.status === 'none') return res.status(401).json({ message: 'Потребна е најава.' });
  if (t.status === 'invalid') return res.status(401).json({ message: 'Токенот е невалиден или истечен. Најавете се повторно.' });
  req.auth = t.payload;
  return next();
}

/** Само за администратор. */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.auth.role !== 'admin') return res.status(403).json({ message: 'Пристапот е дозволен само за администратор.' });
    return next();
  });
}

const isAdmin = (req) => req.auth && req.auth.role === 'admin';

module.exports = { optionalAuth, requireAuth, requireAdmin, isAdmin };
