const path = require('path');
const KoaRouter = require('koa-router');
const send = require('koa-send');
const ctrl = require('./i18nCtrl');
const logger = require('../../../helpers').logger;

let locale = require('locale');
let router = KoaRouter();
let locales = require('../../../../config/locales/supported');
let supported = new locale.Locales(locales, 'en');

// Resolve the wanted locale file as json
router.get('/:locale', async (ctx) => {
  if (ctx.params.locale && ctx.params.locale.trim()) {
    logger.debug('[I18N], received a locale request!');
    let selectedLocale = (new locale.Locales(ctx.params.locale)).best(supported).toString();
    await send(ctx, `${selectedLocale}.json`, {root: `/api/config/locales/`});
    
  } else {
    logger.debug('[I18N], invalid locale request!');
  }
});

router.post('/update', async (ctx) => {
  if (!ctx.request.body.locale && !ctx.state.user && !ctx.state.user.id) {
    ctx.body = ctx.responseEnvelope(ctx, 400, {}, []);
  } else {
    await ctrl.updateLanguage(ctx.state.user.id, ctx.request.body.locale);
    ctx.body = ctx.responseEnvelope(ctx, 200, {updated: true}, []);
  }
});

module.exports = {
  i18n: router
}
