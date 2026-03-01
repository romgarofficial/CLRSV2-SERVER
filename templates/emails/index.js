/**
 * Email Template Index
 * Exports all email templates for easy importing
 */

const welcomeOTPTemplate = require('./welcomeOTP');
const resendOTPTemplate = require('./resendOTP');
const activationConfirmationTemplate = require('./activationConfirmation');
const passwordResetByAdminTemplate = require('./passwordResetByAdmin');

module.exports = {
  welcomeOTPTemplate,
  resendOTPTemplate,
  activationConfirmationTemplate,
  passwordResetByAdminTemplate
};
