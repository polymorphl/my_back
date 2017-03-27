const web = require('../../connection').web;
const Sequelize = require('sequelize');
const mapModel = require('../helpers').mapModel;
const generateQuery = require('../helpers').generateQuery;

let UserSettingsModel = web.define('user_settings',{
  id: {type: Sequelize.INTEGER(11), unique: true, autoIncrement: true},
  user_id: { type: Sequelize.INTEGER(11), allowNull: false, primaryKey: true },
  language: { type: Sequelize.STRING },
  reset_token: { type: Sequelize.STRING },
  reset_token_expire: { type: Sequelize.TIME },
  settings_push_notifications: { type: Sequelize.INTEGER(11) },
  created_at: {type:Sequelize.DATE}
},{
  schema: process.env.MYSQL_DATABASE,
  tableName: 'user_settings',
  timestamps: false,
  scopes: {
    byUserId: function(id) {
      return { where: { user_id: id } }
    },
    byResetToken: function(token) {
      return {
        where: {$and: [
            { reset_token: token },
            { reset_token_expire: { $gte: Sequelize.literal('CURRENT_TIMESTAMP') } }
          ]}
      }
    }
  } // end scopes
});

let UserSettingsRoutines = {
  createUserSettings:  async function(data){
    return UserSettingsModel.create({
      user_id: data.user_id,
      language: data.language,
      settings_push_notifications: 1,
      created_at: Sequelize.fn('NOW')
    });
  },
  updateLanguage: async function(id, locale) {
    return UserSettingsModel.update(
      {language: locale},
      { where: {user_id: id} }
    );
  },
  updatePushNotification: async function(id, binaryMask) {
    // # binaryMask < 1 (General)
    // # Define others
    return UserSettingsModel.update(
      {settings_push_notifications: binaryMask},
      { where: { user_id: id } }
    );
  },
  updateForgotData: async function(id, token, hours) {
    console.log('user id %s, token: %s, hours: %s', id, token, hours)
    return UserSettingsModel.update({
      reset_token: token,
      reset_token_expire: Sequelize.literal(`CURRENT_TIMESTAMP + INTERVAL '${hours}' HOUR `)
    }, { where: { user_id: id }});
  },
  getById: async function(id, query, options) {
    return UserSettingsModel.scope({method: ['byUserId', id]}).findOne(generateQuery(query, UserSettingsModel))
  },
  getByResetToken: async function(token, query, options) {
    return UserSettingsModel.scope({method: ['byResetToken', token]}).findOne(generateQuery(query, UserSettingsModel))
  }
};

const userSettingsSets =  {
  excerpt: ['user_id', 'language', 'reset_token', 'reset_token_expire', 'settings_push_notifications']
};

// Map all routines in the Model
let UserSettings = mapModel(UserSettingsModel, UserSettingsRoutines, userSettingsSets);

// Export the mapped model
module.exports = { UserSettings: UserSettings };
