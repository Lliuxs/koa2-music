const router = require('koa-router')()
router.prefix('/blog')
const axios = require('axios')


router.get('/list', async (ctx, next) => {
  ctx.body = []
})

module.exports = router