const User = require('./web/User').User;
const UserSettings = require('./web/UserSettings').UserSettings;
const PushModule = require('./web/push/index');

/* Define all relations */
// Notifications
//PushActive.web_devices = PushActive.hasMany(PushWeb, { as: 'web_devices', foreignKey: 'configuration_id'});
//PushActive.mobile_devices = PushActive.hasMany(PushMobile, { as: 'mobile_devices', foreignKey: 'configuration_id'});
//PushActive.user = PushActive.belongsTo(User, {as: 'user', foreignKey: 'user_id'});

//Push tags
//PushTag.devices = PushTag.belongsToMany(PushActive, {as: 'devices', through: PushTagRelations, foreignKey: 'tag_id', otherKey: 'user_id'});
//PushTag.users = PushTag.belongsToMany(User, {as:'users', through: PushTagRelations, foreignKey: 'tag_id', otherKey: 'user_id'});
//PushTag.userSettings = PushTag.belongsToMany(UserSettings, {as:'userSettings', through: PushTagRelations, foreignKey: 'tag_id', otherKey: 'user_id'});

module.exports = {
  User: User,
  UserSettings: UserSettings,
  PushActive: PushModule.PushActive,
  PushLogs: PushModule.PushLogs,
  PushWeb: PushModule.PushWeb,
  PushMobile: PushModule.PushMobile,
  PushTag: PushModule.PushTag,
  PushTagRelations: PushModule.PushTagRelations
}
