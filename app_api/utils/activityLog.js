const mongoose = require('mongoose');

const Activity = mongoose.model('Activity');

/**
 * Запишува активност во историскиот преглед.
 * @param {{_id?:string, name?:string}|null} user
 * @param {string} action
 * @param {string} message
 * @param {{_id?:string, title?:string}|null} tour
 */
async function logActivity(user, action, message, tour = null) {
  try {
    await Activity.create({
      user: user && user._id ? user._id : null,
      userName: user && user.name ? user.name : 'Систем',
      tour: tour && tour._id ? tour._id : null,
      tourTitle: tour && tour.title ? tour.title : '',
      action,
      message,
    });
  } catch (err) {
    console.error('Не може да се запише активност:', err.message);
  }
}

module.exports = { logActivity };
