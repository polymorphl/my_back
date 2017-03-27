const KoaRouter = require('koa-router');
const ctrl = require('./NotificationCtrl');
let router = KoaRouter();

const WELCOME_MSG = 'Hello guys !';

router.post('/test', async(ctx) => {
  if (ctx.request.body.token && ctx.request.body.token.trim() && ctx.state.user) {
    let d = {
      text_key: WELCOME_MSG, text_value: JSON.stringify('{}'),
      target_1: ctx.state.user.aid
    };
    let resp = await ctrl.sendNotificationNoRetry(WELCOME_MSG, [ctx.request.body.token]);
    await ctrl.logNotifications(d, 1, resp);
    ctx.body = ctx.responseEnvelope(ctx, 200, {success: true}, []);
  } else {
    ctx.body = ctx.responseEnvelope(ctx, 400, {}, []);
  }
});

router.post('/subscribe', async(ctx) => {
  if (!ctx.request.body.token || !ctx.state.user) {
    ctx.body = ctx.responseEnvelope(ctx, 400, {}, []);
  } else {
    let config = await ctrl.createConfiguration(ctx.request.body);
    if (config.id > 0) {
      await ctrl.subscribeUser(config.type, ctx.state.user.aid, ctx.request.body.token, config.id);
    }
    ctx.body = ctx.responseEnvelope(ctx, 200, {subscribed: true}, []);
  }
});

router.post('/unsubscribe', async(ctx) => {
  if (!ctx.request.body.token || !ctx.state.user) {
    ctx.body = ctx.responseEnvelope(ctx, 400, {}, []);
  } else {
    await ctrl.unSubscribeUser(ctx.request.body.token);
    ctx.body = ctx.responseEnvelope(ctx, 200, {deleted: true}, []);
  }
});

module.exports = { Notification: router }
