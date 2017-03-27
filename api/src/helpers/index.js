const logger = require('./logger').logger;
const validators = require('./validators');

module.exports = {
  logger: logger,
  isNameValid: validators.isNameValid,
  isPasswordValid: validators.isPasswordValid,
  isEmailValid: validators.isEmailValid,
  isForgotTokenValid: validators.isForgotTokenValid
}
