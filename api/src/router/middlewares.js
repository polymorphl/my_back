const jwt = require('jsonwebtoken');
const unless = require('koa-unless');

let removePrefixInAuthorization = function(field) {
  return field != null ? field.substring(4) : false;   // Remove 4 chars ('JWT ');
};

let extractTokenFromHeaders = function(req) {
  let tkn = null;
  if (req && req.headers && req.headers.hasOwnProperty('authorization')) { tkn = req.headers['authorization']; }
  return removePrefixInAuthorization(tkn);
};


/*
  Global middleware defining user if auth token found
 */
let jwtVerify = async function(opts) {
  opts = opts || {};
  opts.key = opts.key || 'user';

  let middleware = async function(ctx, next) {
    let secret = (ctx.state && ctx.state.secret) ? ctx.state.secret : opts.secret;
    if (!secret) {
      throw 'invalid secret';
    }
    let token = extractTokenFromHeaders(ctx.request);
    if(!token){
      await next();
    } else {
      // Token found
      let decode;
      try {
        decode = jwt.verify(token, secret);
      } catch (err) {
        let error = { msg: 'auth.errors.login.1' };
        ctx.body = ctx.responseEnvelope(ctx, 401, {}, [error]);
      }
      if(decode) {
        ctx.state = ctx.state || {};
        ctx.state.user = decode.user;
        await next();
      }
    }
  };
  middleware.unless = unless;
  return middleware;
};

/*
  Blocks route if no user is found
 */
let isAuth = async function(ctx, next){
  if (ctx.state.user){
    await next();
  } else {
    let error = { msg: 'auth.errors.unauthorized' };
    ctx.body = ctx.responseEnvelope(ctx, 401, {}, [error]);
  }
};

let parseQueries = async function(ctx, next){
  if(Object.keys(ctx.query).length > 0){
    ctx.options = {
      fields: ctx.query.fields ? ctx.query.fields.split(',') : null,
      order: ctx.query.order,
      page: ctx.query.page || 1,
      related: ctx.query.related ? ctx.query.related.split(',') : null,
      limit: ctx.query.limit
    };
  }
  await next(); 
};

module.exports = {
  jwtVerify: jwtVerify,
  isAuth: isAuth,
  parseQueries: parseQueries,
  extractTokenFromHeaders: extractTokenFromHeaders,
  removePrefixInAuthorization: removePrefixInAuthorization

}
