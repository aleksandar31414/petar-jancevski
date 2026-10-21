class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

/** Обвивка за async контролери – грешките одат во errorHandler. */
const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Централно справување со грешки – клиентот секогаш добива JSON со порака и статус. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError' && err.errors) {
    const errors = {};
    for (const [field, e] of Object.entries(err.errors)) errors[field] = e.message;
    return res.status(400).json({ message: 'Невалидни податоци.', errors });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Невалидна вредност за полето „${err.path}“.` });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Записот веќе постои.', errors: err.keyValue });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Невалиден JSON во барањето.' });
  }
  if (err.status) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }
  console.error(err);
  return res.status(500).json({ message: 'Грешка на серверот. Обидете се повторно.' });
}

module.exports = { HttpError, asyncH, errorHandler };
