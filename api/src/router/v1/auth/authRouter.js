const jwt = require('jsonwebtoken');
const KoaRouter = require('koa-router');
const ctrl = require('./authCtrl').ctrl;
const isAuth = require('../../middlewares').isAuth;
const helpers = require('../../../helpers');
const logger = helpers.logger;
const isEmailValid = helpers.isEmailValid;
const isNameValid = helpers.isNameValid;
const isPasswordValid = helpers.isPasswordValid;
const isForgotTokenValid = helpers.isForgotTokenValid;
const User = require('../../../model').User;
const cert = require('../../../../config/secret').secret;

let router = KoaRouter();

/*
** TEST Email
* */
router.post('/checkEmail', async(ctx) => {
  if (!isEmailValid(ctx.request.body.email.trim())) {
    ctx.responseEnvelope(ctx, 400, {}, []);
  }
  let p = { email_valid: await ctrl.isEmailAvailable(ctx.request.body.email) };
  ctx.body = ctx.responseEnvelope(ctx, 200, p, []);
});

/*
 ** Login -- WEB
 * */
router.post('/', async(ctx) => {
  if (!isEmailValid(ctx.request.body.email) &&
      !isPasswordValid(ctx.request.body.password)) {
    ctx.body = ctx.responseEnvelope(ctx, 400, {}, []);
  }
  let auth = await ctrl.signin(ctx.request.body.email, ctx.request.body.password);
  console.log('auth', auth);
  if(auth.error){
    ctx.body = ctx.responseEnvelope(ctx, 401, {}, [auth.data]);
  } else {
    let tokenData = { user: auth.data };
    let tkn = jwt.sign(tokenData, cert);
    // Set Authorization header
    ctx.response.set('authorization', `JWT ${tkn}`);
    // delete password from response
    delete auth.data.password;
    logger.info('Login done for %s', auth.data.email);
    // send
    ctx.body = ctx.responseEnvelope(ctx, 200, auth.data, []);
  }
  // TODO: reimplement cookie for web connection
  // let cookieOpt = {
  //   path: '/',
  //   maxAge: 1000 * 3600 * 24 * 30,
  //   httpOnly: true,
  //   domain: process.env.DOMAIN,
  //   secure: true
  // };
  // if (process.env.EXEC_MODE == 2) {
  //   cookieOpt.secure = false;
  // }
  // ctx.cookies.set('tkn', jwt.sign(tokenData, cert), cookieOpt);
});

/*
 ** Logout
 * */
router.delete('/', isAuth, async(ctx) => {
  ctx.response.remove('authorization');
  ctx.body = ctx.responseEnvelope(ctx, 200, {}, []);
});

/*
 ** Register
 * */
router.post('/register', async(ctx, next) => {
  await ctrl.register(ctx);
});

//a loading user will try to auth with cookie on this route..
router.get('/pingAuth', async(ctx) => {
  ctx.body = ctx.responseEnvelope(ctx, 200, {}, []);
  // if(ctx.state.user){
  //   let user = await User.c.getById(ctx.state.user.id, {
  //     include: [{
  //       association: User.settings, as: 'settings'
  //     },{
  //       association: User.devices
  //     }],
  //   });
  //   logger.info('USER FOUND => %s(%)', ctx.state.user.account, ctx.state.user.id);
  //   ctx.body = ctx.responseEnvelope(ctx, 200, user.toJSON(), []);
  // } else {
  //   ctx.body = ctx.responseEnvelope(ctx, 200, null, [{ msg: 'auth.errors.login.2' }]);
  // }
});

/*
 Generate a token in Database for a specific user
 ** Token have an expire date (timestamp)
 * Warning: unixTimestamp VS javascriptTimestamp
 *
 */
router.post('/forgot', async(ctx) => {
  if (!ctx.request.body && !isEmailValid(ctx.request.body.email.trim())) {
     ctx.responseEnvelope(ctx, 400, {}, []);
  } else {
    let state = await ctrl.forgotPassword(ctx.request.body.email, ctx.request.body.account);
    if (!state) {
      ctx.body = ctx.responseEnvelope(ctx, 400, {}, [{ msg: 'auth.errors.forgot.0'}]);
    } else {
      ctx.body = ctx.responseEnvelope(ctx, 200, { }, []);
    }
  }
});

/*
* Route for update user's password 
* */
router.post('/forgot/update', async(ctx) => {
  if (!ctx.request.body
      && !isForgotTokenValid(ctx.request.body.token)
      && !isPasswordValid(ctx.request.body.newPassword)) {
    ctx.body = ctx.responseEnvelope(ctx, 400, {}, []);
  } else {
    let state = await ctrl.changePassword(ctx.request.body.token, ctx.request.body.newPassword);
    if (!state) {
      ctx.body = ctx.responseEnvelope(ctx, 400, {}, [ { msg: "auth.errors.reset.0" }]);
    } else {
      let success = { msg: 'auth.success.reset.0'};
      ctx.body = ctx.responseEnvelope(ctx, 200, {}, [success]);
    }
  }
});


module.exports = { Auth: router }
