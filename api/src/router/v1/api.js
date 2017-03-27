const KoaRouter = require('koa-router');
const send = require('koa-send');
const logger = require('../../helpers/logger');

const i18n = require('./i18n/i18nRouter').i18n;
const Profile = require('./profile/profileRouter').Profile;
const Auth = require('./auth/authRouter').Auth;
const Notification = require('./notification/NotificationRouter').Notification;
const NotifCtrl = require('./notification/NotificationCtrl').ctrl;
const isAuth = require('../middlewares').isAuth;

const _prefix = '/v1';
const NotificationSvc = require('../../services/notifications');
const api = KoaRouter({ prefix: _prefix });

// DEVELOPMENT ROUTES
if (process.env.NODE_ENV != 'production') {
  api.get('/test', async (ctx) => {
    console.log('hit test');
    ctx.body = ctx.query;
  });
  api.get('/broadcast', async(ctx, next) => {
    let tokensList = await NotifCtrl.getAllSubscribedUsers();
    if(tokensList.length > 0) {
      let tokens = [];
      for(let tk in tokensList) {
        if(tokensList.hasOwnProperty(tk)){
          tokens.push(tokensList[tk].device_token);
        }
      }
      NotificationSvc.send('Hey Yo', tokens).then(function(to) {
        logger.debug('Response', to);
      }).catch(function(err) {
        logger.debug('err', err);
      });
    }
  });
}

// PRODUCTION ROUTES
let addRoute = function(path, router, middleware){
  if(middleware){
    api.use(path, middleware, router.routes(), router.allowedMethods());
  }
  else {
    api.use(path, router.routes(), router.allowedMethods());

  }
};

/* Unlogged routes */
addRoute('/i18n', i18n);
addRoute('/auth', Auth); /* Signup, login, forgot, ping Auth */

/* Logged routes */
addRoute('/profile', Profile, isAuth);
addRoute('/notifications', Notification, isAuth);

module.exports = {
  api: api
}
