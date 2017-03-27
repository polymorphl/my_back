const model = require('../../../model');
const PushWeb = model.PushWeb;
const PushMobile = model.PushMobile;
const PushActive = model.PushActive;
const PushLogs = model.PushLogs;
const UserSettings = model.UserSettings;
const logger = require('../../../helpers');

const _googleBackend = `https://iid.googleapis.com/iid/v1/IID_TOKEN/rel/topics/TOPIC_NAME`;
const NotificationSvc = require('../../../services/notifications');
const WEB = "0";
const MOBILE = "1";

let request = require('request');

let ctrl = {
  /*
   *  Create Configuration based on device info || browser info
   * */
  async createConfiguration(obj) {
    let type =  obj.device ? "1": "0";
    let _id = {}; _id.id = 0;
    let already_exist = false;

    if (type === WEB) {
      _id = await PushWeb.c.findConfig(obj);
      if (_id === null) {
        _id = await PushWeb.c.createConfig(obj);
      } else { already_exist = true; }
    } else if (type === MOBILE) {
      _id = await PushMobile.c.findConfig(obj);
      if (_id === null) {
        _id = await PushMobile.c.createConfig(obj);
      } else { already_exist = true; }
    }
    return {
      id: _id.id,
      already_exist: already_exist,
      type: type
    };
  },

  /*
   *  Link a user  <=> configuration
   *  enableDevice => Find by token, if not found, create the configuration
   * */
  async subscribeUser(type, aid, token, configID) {
    return await PushActive.c.enableDevice(type, aid, token, configID);
  },

  /*
   *  Unlink a user <=> configuration
   *  disableDevice => Find by token, update the row
   * */
  async unSubscribeUser(token) {
    return await PushActive.c.disableDevice(token);
  },

  /*
   *  [Ping-Pong] Send a Welcome Message (Push Notification)
   * */
  async sendNotificationNoRetry(msg, tokens) {
    return await NotificationSvc.sendOneTime(msg, tokens);
  },

  /*
   *  log in Database each Push Notifications
   *  Required:
   *  - data.text_key : string
   *  - data.text_value : JSON string
   *  - data.target_1 at least : int
   *  - resp : JSON string
   * */
  async logNotifications(data, type, resp) {
    if (type === 0) {
      return await PushLogs.c.logTagNotification(data, resp);
    } else if (type === 1) {
      return await PushLogs.c.logPlayerNotification(data, resp);
    }
  },


  /*
   *  Get a user_id based on token
   * */
  async getDeviceByToken(token) {
    // TODO when relations are ready
  },

  // TODO prefix google request function with GCM like: GCM_SubscribeUserToTopic
  subscribeUserToTopic: (obj) => {
    return new Promise(function(resolve, reject) {
      if (parseInt(obj.aid, 10) && obj.topic.trim() != "") {
        logger.debug('[notificationctrl] valid data');
        request({
          method: 'POST',
          headers: {
            'Authorization': process.env.FIREBASE_API_KEY
          },
          url: `https://iid.googleapis.com/iid/v1/___IIDTOKEN___/rel/topics/${obj.topic}`,
        }, function(err, resp, body){
          if (err) console.error('request failed:', err);
          logger.debug('BODY', body);
        });
        resolve(42);
      } else {
        reject(-1);
      }
    });
  },
  /* POST */
  unsubscribeUserToTopic: (obj) => {

  },
  /* GET */
  getAllSubscribedUsers: () => {
    return new Promise(function(resolve, reject) {
      PushActive.findAll({
        attributes: ['device_token']
      }).then(function (users) {
        resolve(users.toJSON());
      }).catch(function (err) {
        logger.alert(err);
        reject(err);
      });
    });
  },
  /* GET */
  getSubscribedUsersByTopic: function() {}
};

module.exports = { ctrl: ctrl };
