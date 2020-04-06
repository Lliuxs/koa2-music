const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('koa2-cors')
const redis = require('redis')
const getAccessToken = require('./utils/getAccessToken-redis')
const client = redis.createClient(6379, "localhost")
const options = {client: client, db: 1}
const session = require('koa-generic-session')
const redisStore = require('koa-redis')({ options })


const index = require('./routes/index')
const users = require('./routes/users')
const blog = require('./routes/blog')
const ENV = 'test'

// error handler
onerror(app)

// 跨域
app.use(cors({
  origin: ['http://localhost:9528'],
  credentials: true
}))


app.keys = ['keys', 'music'];

app.use(async (ctx, next) => {
  await getAccessToken()
  await next()
})

app.use(session({
  store: redisStore
}));


app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))

app.use(json())

// app.use(logger())

app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

app.use(async (ctx, next)=>{
  ctx.state.env = ENV
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
app.use(blog.routes(), blog.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app