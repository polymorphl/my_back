const Koa = require('koa');
const helmet = require('koa-helmet');
const cors = require('kcors');
const i18n = require('koa-i18n');
const locale = require('koa-locale');
const bodyParser = require('koa-bodyparser');

const router = require('./v1').api;
const middlewares = require('./middlewares');
const jwtVerify = middlewares.jwtVerify;
const parseQueries = middlewares.parseQueries;
const cert = require('../../config/secret').secret;

const env = process.env.NODE_ENV || 'development';

let routerApp = () => {
  let app = new Koa();

  // Get locale variable from query, subdomain, accept-languages or cookie
  locale(app);

  let supportedLocales = require(`../../config/locales/supported`);
  
  // Define i18n options  #URL https://github.com/koa-modules/i18n
  let i18_opts = {
    directory: `config/locales`,
    extension: '.json',
    locales: supportedLocales,
    modes: [
      'query', //  optional detect querystring - `/?locale=fr`
    ]
  };

  // SAVE supported locales in Koaapp (linked to i18n router)
  global.supported_locales = i18_opts.locales;

  // Middlewares part
  if (env !== 'production') {
    const logger = require('koa-logger');
    // Development
    app.use(logger()) /* For log each request */
  } // end of dev middlewares

  // Prepare CORS whitelist
  let whitelist = [
    `http://127.0.0.1:${process.env.APP_PORT}`, // HTTP domain
    `http://${process.env.DOMAIN}`, // HTTP domain
    `https://${process.env.DOMAIN}`,
    `https://${process.env.DOMAIN}:${process.env.APP_PORT}`,
    `https://127.0.0.1:${process.env.APP_PORT}`
  ];

  function checkWhitelist(ctx) {
    let ori = ctx.request.header.origin;
    if (whitelist.indexOf(ori) >= 0) {
      return ori;
    } else {
      console.log('not in whitelist =>', ori);
      return whitelist[0];
    }
  }

  /* Build Response Object */
  /* INFO: Available in ctx object */
  // ARGS: ctx, status(numeric), payload(object/array), msgs(array of object),
  // Example for a msgs -->  [{ msg: 'error_code_name', }]
  // USAGE:
  // ex: ctx.body = global.responseEnvelope(200, null, {x: 200, y: 34})
  // ex: ctx.body = global.responseEnvelope(400, errors, null)
  function responseEnvelope(ctx, status, payload, msgs) {
    let m = msgs.length > 0 ? msgs : [];
    let p = typeof payload === 'object' ? payload : {};
    let proto = {
      meta: {status: status, msgs: m },
      payload: p
    };
    // Set the status
    ctx.status = status;
    // Return the response object
    return proto;
  }
  
  // general
  app
    .use(helmet())
    .use(helmet.hidePoweredBy())
    .use(i18n(app, i18_opts))
    .use(cors({
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTION']
    }))
    .use(bodyParser({
      extendTypes: {
        json: ['application/x-javascript'] // will parse application/x-javascript type body as a JSON string
      }
    }))
    //.use(jwtVerify({secret: cert}))
    //.use(parseQueries)
    .use(async(ctx, next) => {
      // add custom function as middleware
      ctx.responseEnvelope = responseEnvelope;
      await next();
    })
    .use(router.api.routes())
    .use(router.api.allowedMethods());

  // # Error Handler part for Koa routerApp
  app.use(async(ctx, next) => {
    try {
      await next();
      const status = ctx.status || 404;
      if (status === 404) {
        ctx.throw(404);
      }
    } catch (err) {
      ctx.status = err.status || 500;
      if (ctx.status === 404) {
        await ctx.responseEnvelope(ctx, 404, {}, []);
      } else {
        await ctx.responseEnvelope(ctx, ctx.status, {}, []);
      }
    }
  });
  return app;
};

module.exports = {
  routerApp: routerApp
}
