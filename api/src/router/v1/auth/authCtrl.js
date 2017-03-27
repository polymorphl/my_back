const crypto = require('crypto');
const model = require('../../../model');
const User = require('../../../model').User;
const UserSettings = model.UserSettings;
const C = require('../../../const').C;
const sendEmail = require('../../../services/emails').sendEmail;
const helpers = require('../../../helpers');
const logger = helpers.logger;
const isNameValid = helpers.isNameValid;
const isPasswordValid = helpers.isPasswordValid;
const isEmailValid = helpers.isEmailValid;
const isForgotTokenValid = helpers.isForgotTokenValid;

const FORGOT_TOKEN_LENGTH = process.env.FORGOT_TOKEN_LENGTH || 20;
const FORGOT_TOKEN_HOURS_VALIDITY = 2;

let ctrl = {
  generateForgotToken: function() {
    return crypto.randomBytes(FORGOT_TOKEN_LENGTH).toString('hex');
  },

  /*
  ** Send an email when user forgot his password
  */
  sendForgotEmail: async function (email, token) {
    let options = {
      user_email: email,
      title: 'Reset your password',
      link: `https://${process.env.DOMAIN}/reset/${token}`
    };
    let emailState = await sendEmail('l@t.test', options.user_email, options.title, 'recovery', options)
    if (emailState.err) {
      logger.warn('Forgot email not sent', emailState.err);
      return false;
    } else {
      logger.info('Forgot email sent', emailState.data);
      return true;
    }
  },

  /* 
  ** Reset, update user's password
  */
  changePassword: async function(token, password) {
    let done = false;
    let userSettings = await UserSettings.c.getByResetToken(token);
    if (userSettings) {
      let _userSettings = userSettings.toJSON();
      let userUpdated = await User.c.changePassword(_userSettings.user_id, password);
      // unset the token from userSettings
      await userSettings.update({ reset_token: '' });
      done = true;
    }
    return done;
  },

  /*
  ** Forgot, add token to user's settings
  */
  addForgotTokenToUser: async function (email, token) {
    let user = await User.c.getByEmail(email);
    if (user) {
      user = user.toJSON();
      let forgotData = await UserSettings.c.updateForgotData(user.id, token, FORGOT_TOKEN_HOURS_VALIDITY);
      return user;
    }
    return false;
  },

  /*
  ** Forgot, manage the flow
  */
  forgotPassword: async function(email){
    // check email
    let done = false;
    let token = ctrl.generateForgotToken();
    if (token) {
      let user = await ctrl.addForgotTokenToUser(email, token);
      if (user) {
        return done = await ctrl.sendForgotEmail(user.email, token);
      }
    }
    return done;
  },

  /*
  ** Login
  */
  signin: async function(username, password){
    let userIsLogged = await User.c.login(username, password);
    if(!userIsLogged){
      return { error: true, data: { msg: "auth.errors.login.0"}};
    } else {
      return { error: false, data: userIsLogged };
    }
  },
  
  /*
  ** Register
  */
  register: async function(ctx){
    let d = ctx.request.body;
    let e = [];

console.log('createUser',User.c.createUser())
    // Todo manage I/O non blocking check
    // TODO Parralel call Promise.All ....
    // TODO see validators, infinte arguments

    if(!await isNameValid(d.firstname) && !await isNameValid(d.lastname)){
      e.push({msg: 'auth.errors.register.0'});
    }
    if(!await isPasswordValid(d.password, d.confirmPassword)) {
      e.push({msg: 'auth.errors.register.1'});
    }
    if(!await isEmailValid(d.email)){
      e.push({msg: 'auth.errors.register.2'});
    }

    if(e.length > 0){
      ctx.body = ctx.responseEnvelope(ctx, 401, {}, [e]);
    } else {
      logger.info(User);
      let user = await User.c.createUser(d.email, d.password, d.firstname, d.lastname);
      user = user.toJSON();
      // create the user settings row
      let tmp_settings = {
        user_id: user.id,
        language: process.env.DEFAULT_LANGUAGE
      };
      await UserSettings.c.createUserSettings(tmp_settings);

      // remove password & add ID to the payload
      delete d.password;
      delete d.confirmPassword;
      d.id = user.id;

      ctx.body = ctx.responseEnvelope(ctx, 200, d, []);
    }
  },

  /*
  ** Check: is email isEmailAvailable ?
  */
  isEmailAvailable: async (email)=> {
    /* TODO: blacklisted domains check?
     */
    return !await User.c.getByEmail(email);
  }
};


module.exports = { ctrl: ctrl }
