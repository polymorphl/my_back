let C = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 70,
  PWD_MIN_LENGTH: 8,
  PWD_MAX_LENGTH:32,
  NICKNAME_REGEX:/[a-zA-Z0-9\!\-\_?.:\\]*/,
  EMAIL_REGEX:/^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-?\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
  SOCKET_TIMEOUT: 60000
};

module.exports = { C: C };
