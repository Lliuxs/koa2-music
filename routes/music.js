const router = require('koa-router')()
const axios = require('axios')
router.prefix('/music')

// 调用云函数
router.get('/list', async (ctx, next) => {
  const query = ctx.request.query // get请求获取参数 后台管理系统使用表格 一般会page和pagesize
  const url = `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${ctx.state.access_token}&env=${ctx.state.env}&name=music`
  const {
    data
  } = await axios.post(url, {
    $url: 'playlist',
    start: parseInt(query.start),
    count: parseInt(query.count)
  })
  let list = []
  if (data.errcode === 0) {
    list = data.resp_data
  }
  ctx.body = list
})

// 操作云数据库 异常处理
router.get('/getById', async (ctx, next) => {
  // const query = `db.collection('playlist').doc('${ctx.request.query.id}').get()`
  const query = `db.collection("playlist").where({_id: "${ctx.request.query.id}" }).get()`
  const url = `https://api.weixin.qq.com/tcb/databasequery?access_token=${ctx.state.access_token}`
  const {
    data
  } = await axios.post(url, {
    env: ctx.state.env,
    query
  })
  ctx.body = JSON.parse(data.data)
})

router.post('/update', async (ctx, next) => {
  const item = ctx.request.body
  const url = `https://api.weixin.qq.com/tcb/databaseupdate?access_token=${ctx.state.access_token}`
  const query = `
    db.collection("playlist")
      .where({_id: "${item._id}" })
      .update({data:{
        name: "${item.name}",
        copywriter: "${item.copywriter}"
      }})`
  console.log(query)
  const {
    data
  } = await axios.post(url, {
    env: ctx.state.env,
    query
  })
  ctx.body = data
})

router.get('/del', async (ctx, next) => {
  // 逻辑应该封装在controller层
  const id = ctx.request.query.id
  const url = `https://api.weixin.qq.com/tcb/databasedelete?access_token=${ctx.state.access_token}`
  const {
    data
  } = await axios.post(url, {
    env: ctx.state.env,
    "query": `db.collection("playlist").where({_id:"${id}"}).remove()`
  })
  console.log(data)
  ctx.body = data
})


module.exports = router