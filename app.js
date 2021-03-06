const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const koaBody = require('koa-body') // 处理文件
const logger = require('koa-logger')
const cors = require('koa2-cors')
const getAccessToken = require('./utils/getAccessToken.js')
const index = require('./routes/index')
const users = require('./routes/users')
const music = require('./routes/music')
const blog = require('./routes/blog')
const swiper = require('./routes/swiper')
const ENV = 'lxs' // 环境id不是环境名称

// error handler
// onerror(app)

// 跨域
app.use(cors({
  origin: '*'
}))


app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
  }
}));

app.use(json())

// app.use(logger())

app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

app.use(async (ctx, next) => {
  const access_token = await getAccessToken()
  ctx.state.env = ENV
  ctx.state.access_token = access_token
  await next()
})

// logger
// app.use(async (ctx, next) => {
//   const start = new Date()
//   await next()
//   const ms = new Date() - start
//   console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
// })

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(music.routes(), music.allowedMethods())
app.use(blog.routes(), blog.allowedMethods())
app.use(swiper.routes(), swiper.allowedMethods())

// error-handling
// app.on('error', (err, ctx) => {
//   console.error('server error', err, ctx)
// });

module.exports = app