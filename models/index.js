
/**
 * ===========================================
 * MODELS INDEX
 * ===========================================
 * Centralized exports for all Mongoose models
 */

const User = require('./User');
const Laboratory = require('./Laboratory');
const Report = require('./Report');
const Notification = require('./Notification');
const News = require('./News');

module.exports = {
  User,
  Laboratory,
  Report,
  Notification
  ,News
};
