const mongoose = require('mongoose');

// Модели (се регистрираат при вчитување)
require('./user');
require('./location');
require('./equipment');
require('./tour');
require('./registration');
require('./comment');
require('./activity');

/**
 * Избор на база:
 *  - NODE_ENV=production и постои MONGODB_ATLAS_URI → продукциска база (MongoDB Atlas)
 *  - инаку → локална база (MONGODB_URI, на пр. Docker контејнерот „mongo“)
 */
function resolveDbUri() {
  if (process.env.NODE_ENV === 'production' && process.env.MONGODB_ATLAS_URI) {
    return { uri: process.env.MONGODB_ATLAS_URI, label: 'MongoDB Atlas (продукција)' };
  }
  return {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vrvtura',
    label: 'локална MongoDB',
  };
}

async function connect() {
  const { uri, label } = resolveDbUri();
  mongoose.connection.on('connected', () => console.log(`Mongoose е поврзан со ${label}.`));
  mongoose.connection.on('error', (err) => console.error('Mongoose грешка:', err.message));
  mongoose.connection.on('disconnected', () => console.log('Mongoose е исклучен.'));
  await mongoose.connect(uri);
}

async function shutdown(signal) {
  await mongoose.connection.close();
  console.log(`Mongoose е затворен (${signal}).`);
  process.exit(0);
}
process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

module.exports = { connect, resolveDbUri };
