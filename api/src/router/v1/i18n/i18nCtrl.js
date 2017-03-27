const UserSettings = require('../../../model').UserSettings;

let ctrl = {
  async updateLanguage(id, locale) {
    return await UserSettings.c.updateLanguage(id, locale);
  }
};

module.exports = { ctrl: ctrl }
