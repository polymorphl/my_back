const web = require('../../../connection').web;
const Sequelize = require('sequelize');
const mapModel = require('../../helpers').mapModel;
const generateQuery = require('../../helpers').generateQuery;

let platform = require('platform');

/*
 ** -- MODEL DEFINITION
 */

let PushModelWeb = web.define('push_configuration_web',{
  id: {type: Sequelize.INTEGER.UNSIGNED, unique: true, primaryKey: true, autoIncrement: true},
  manufacturer: {type: Sequelize.STRING},
  useragent: {type: Sequelize.STRING},
  platform: {type:Sequelize.STRING},
  version: {type:Sequelize.STRING},
  bplatform: {type: Sequelize.STRING},
  bversion: {type:Sequelize.STRING},
  created_at: {type:Sequelize.DATE}
},{
  schema: process.env.MYSQL_DATABASE,
  tableName: 'push_configuration_web',
  timestamps: false
});


let PushModelMobile = web.define('push_configuration_mobile',{
  id: {type: Sequelize.INTEGER.UNSIGNED, unique: true, primaryKey: true, autoIncrement: true},
  model: {type: Sequelize.STRING},
  device_type: {type: Sequelize.STRING},
  os: {type: Sequelize.STRING},
  os_version: {type: Sequelize.STRING},
  sdk_version: {type: Sequelize.STRING},
  manufacturer: {type: Sequelize.STRING},
  uuid: {type: Sequelize.STRING},
  created_at: {type:Sequelize.DATE}
},{
  schema: process.env.MYSQL_DATABASE,
  tableName: 'push_configuration_mobile',
  timestamps: false,
});

let PushActiveModel = web.define('push_active_devices', {
  id: {type: Sequelize.INTEGER.UNSIGNED, unique: true, primaryKey: true},
  user_id: {type: Sequelize.INTEGER.UNSIGNED},
  configuration_type: {type: Sequelize.INTEGER.UNSIGNED},
  configuration_id: {type: Sequelize.INTEGER.UNSIGNED},
  token: {type: Sequelize.STRING},
  enable: {type: Sequelize.INTEGER.UNSIGNED},
  created_at: {type:Sequelize.DATE}
},{
  schema: process.env.MYSQL_DATABASE,
  tableName: 'push_active_devices',
  timestamps: false,
  scopes: {
    byConfigId: function(configID) {
      return {
        where: { configuration_id: configID }
      }
    },
    byUserId: function(id){
      return {
        where:{
          user_id: id
        }
      }
    },
    byId: function(id) {
      return {
        where: {
          id: id
        }
      }
    },
    byToken: function(token) {
      return {
        where: { token: token }
      }
    }
  }
});

let PushLogsModel = web.define('push_logs', {
  id: {type: Sequelize.INTEGER.UNSIGNED, unique: true, primaryKey: true},
  text_key: {type: Sequelize.STRING},
  text_value: {type: Sequelize.STRING},
  target_type: {type: Sequelize.STRING},
  target_id: {type: Sequelize.INTEGER.UNSIGNED},
  target_1: {type: Sequelize.INTEGER.UNSIGNED},
  target_2: {type: Sequelize.INTEGER.UNSIGNED},
  target_3: {type: Sequelize.INTEGER.UNSIGNED},
  target_4: {type: Sequelize.INTEGER.UNSIGNED},
  target_5: {type: Sequelize.INTEGER.UNSIGNED},
  response: {type: Sequelize.TEXT},
  created_at: {type:Sequelize.DATE}
},{
  schema: process.env.MYSQL_DATABASE,
  timestamps: false,
  scopes: {
    byToken: function(token) {
      return { where: { target_token: token } }
    },
    byType: function(type) {
      return { where: { target_type: type } }
    },
  }
});


/*
** -- ROUTINES
*/

let PushWebRoutines = {
  findConfig: async function(data) {
    let tmp = platform.parse(data.userAgent);
    let browser = {
      platform: tmp.name, version: tmp.version
    };
    let os = {
      platform: tmp.os.family, version: tmp.os.version
    };
    return PushModelWeb.findOne({
      where: {
        $and:[
          {manufacturer: 'web'},
          {useragent: tmp.ua},
          {platform: os.platform},
          {version: os.version},
          {bplatform: browser.platform},
          {bversion: browser.version}
        ]
      },
      attributes: ['id']
    })
  },
  createConfig: async function(data) {
    //prepare data
    let tmp = platform.parse(data.userAgent);
    let browser = {
      platform: tmp.name, version: tmp.version
    };
    let os = {
      platform: tmp.os.family, version: tmp.os.version
    };
    return PushModelWeb.create({
      manufacturer: 'web',
      useragent: tmp.ua,
      platform: os.platform,
      version: os.version,
      bplatform: browser.platform,
      bversion: browser.version
    });
  }
};

let PushMobileRoutines = {
  findConfig: async function(data) {
    return PushModelMobile.findOne({
      where: {
        $and:[
          {model: data.device.model},
          {device_type: data.device.deviceType},
          {os: data.device.os},
          {os_version: data.device.osVersion},
          {sdk_version: data.device.sdkVersion},
          {manufacturer: data.device.manufacturer}
        ]
      },
      attributes: ['id']
    })
  },
  createConfig: async function(data) {
    return PushModelMobile.create({
      model: data.device.model,
      device_type: data.device.deviceType,
      os: data.device.os,
      os_version: data.device.osVersion,
      sdk_version: data.device.sdkVersion,
      manufacturer: data.device.manufacturer,
      uuid: data.device.uuid
    });
  }
};

let PushActiveRoutines = {
  enableDevice: async function(type, id, token, configID) {
    return PushActiveModel.findOne({
      where: { token: token }
    }).then(function(device) {
      if (device) {
        return device.update({ enable: 1 });
      } else {
        return PushActiveModel.create({
          configuration_id: configID,
          configuration_type: type,
          token: token,
          user_id: id,
          enable: 1
        });
      }
    });
  },
  disableDevice: async function(token) {
    return PushActiveModel.update(
      { enable: 0 },
      { where: { token: token }}
    );
  },
  removePushUser: async function(token) {
    return PushActiveModel.destroy({
      where: {
        token: token
      }
    });
  },
  getByConfigId: async function(configID, query, opt){
    return PushActiveModel.scope({method:['byConfigId', configID]}).findOne(generateQuery(query, PushActiveModel))
  },
  getByUserId: async function(userId, query, opt){
    return PushActiveModel.scope({method:['byUserId', userId]}).findAll(generateQuery(query, PushActiveModel))
  },
  getById: async function(id, query, opt){
    return PushActiveModel.scope({method:['byId', id]}).findOne(generateQuery(query, PushActive));
  }
};

let PushLogsRoutines = {
  logPlayerNotification: async function(data, resp) {
    return PushLogsModel.create({
      text_key: data.text_key,
      text_value: data.text_value,
      target_type: 1,
      target_1: data.target_1,
      target_2: data.target_2 ? data.target_2 : null,
      target_3: data.target_3 ? data.target_3 : null,
      target_4: data.target_4 ? data.target_4 : null,
      target_5: data.target_5 ? data.target_5 : null,
      response: JSON.stringify(resp),
    });
  },
  logTagNotification: async function(data, resp) {
    return PushLogsModel.create({
      text_key: data.text_key,
      text_value: data.text_value,
      target_type: 0,
      target_1: data.target_1,
      target_2: data.target_2 ? data.target_2 : null,
      target_3: data.target_3 ? data.target_3 : null,
      target_4: data.target_4 ? data.target_4 : null,
      target_5: data.target_5 ? data.target_5 : null,
      response: JSON.stringify(resp)
    });
  },
  getByToken: async function(token, query, options){
    return PushLogsModel.scope({method:['byToken', token]}).find(generateQuery(query, PushLogsModel));
  },
  getByType: async function(type, query, options){
    return PushLogsModel.scope({method:['byType', type]}).find(generateQuery(query, PushLogsModel));
  }
}

/*
 ** -- MODEL Routines -- MAP
 */

let PushWeb = mapModel(PushModelWeb, PushWebRoutines, {});
let PushMobile = mapModel(PushModelMobile, PushMobileRoutines, {});
let PushActive = mapModel(PushActiveModel, PushActiveRoutines, {});
let PushLogs = mapModel(PushLogsModel, PushLogsRoutines, {});

module.exports = {
  PushActive: PushActive,
  PushWeb: PushWeb,
  PushMobile: PushMobile,
  PushLogs: PushLogs
}
