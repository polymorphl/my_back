const KoaRouter = require('koa-router');
const ctrl = require('./profileCtrl');

let router = KoaRouter();

router.get('/', async(ctx, next)=>{
  let user = await ctrl.getUserById(ctx.state.user.id, ctx.options);
  if(!user) { ctx.body = ctx.responseEnvelope(ctx, 400, {}, []); }
  else ctx.body = ctx.responseEnvelope(ctx, 200, user.toJSON(), []);
});

router.get('/:id', async(ctx, next)=>{
  if(isNaN(ctx.params.id)) {
    ctx.body = ctx.responseEnvelope(ctx, 400, {}, []);
  } else {
    let user = await ctrl.getUserById(ctx.params.id, ctx.options);
    if(!user) { ctx.body = ctx.responseEnvelope(ctx, 400, {}, []); }
    else { ctx.body = ctx.responseEnvelope(ctx, 200, user.toJSON(), []); }
  }
});

module.exports = { Profile: router };
