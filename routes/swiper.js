const router = require('koa-router')()
const fs = require('fs')
router.prefix('/swiper')
const axios = require('axios')
const rp = require('request-promise');


router.get('/list', async (ctx, next) => {
  // 默认是获取10条数据
  const url = `https://api.weixin.qq.com/tcb/databasequery?access_token=${ctx.state.access_token}`
  const {
    data
  } = await axios.post(url, {
    env: ctx.state.env,
    query: "db.collection('swiper').get()"
  })
  // 网页端是不支持fileid的
  const fileList = []
  for (let i = 0; i < data.data.length; i++) {
    fileList.push({
      fileid: JSON.parse(data.data[i]).fileid,
      max_age: 7200
    })
  }
  const fileUrl = `https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ctx.state.access_token}`
  const result = await axios.post(fileUrl, {
    env: ctx.state.env,
    file_list: fileList
  })
  const list = result.data.file_list
  const resultArr = []
  for (let j = 0; j < list.length; j++) {
    resultArr.push({
      download_url: list[j].download_url,
      fileid: list[j].fileid,
      _id: JSON.parse(data.data[j])._id
    })
  }
  ctx.body = resultArr
})


router.post('/upload', async (ctx, next) => {
  // 1.通过path获取文件上传信息
  const file = ctx.request.files.file
  const path = `swiper/${Date.now()}-${Math.random()}-${file.name}`
  const fileUrl = `https://api.weixin.qq.com/tcb/uploadfile?access_token=${ctx.state.access_token}`
  const {
    data: info
  } = await axios.post(fileUrl, {
    env: ctx.state.env,
    path // 上传路径
  });
  console.log(info, path)
  // 2.上传图片
  const params = {
    method: 'POST',
    headers: {
      'content-type': 'multipart/form-data'
    },
    uri: info.url,
    formData: {
      key: path,
      Signature: info.authorization,
      'x-cos-security-token': info.token,
      'x-cos-meta-fileid': info.cos_file_id,
      file: fs.createReadStream(file.path)
    },
    json: true
  }
  await rp(params)

  // await axios({
  //   method: 'post',
  //   url: info.url,
  //   headers: {
  //     // "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8'
  //     'Content-Type': 'multipart/form-data'
  //   },
  //   data: {
  //     key: path,
  //     Signature: info.authorization,
  //     'x-cos-security-token': info.token,
  //     'x-cos-meta-fileid': info.cos_file_id,
  //     file: fs.createReadStream(file.path)
  //   },
  // })

  // 3.写入数据库 data.file_id
  const url = `https://api.weixin.qq.com/tcb/databaseadd?access_token=${ctx.state.access_token}`
  const query = `db.collection("swiper").add({
    data: [
      {fileid: "${info.file_id}"}
    ]
  })`
  const uploadResult = await axios.post(url, {
    env: ctx.state.env,
    query
  })
  ctx.body = uploadResult.data.id_list
})

router.get('/del', async (ctx, next) => {
  // 1.删除数据库中数据
  const params = ctx.request.query
  const url = `https://api.weixin.qq.com/tcb/databasedelete?access_token=${ctx.state.access_token}`
  const {
    data
  } = await axios.post(url, {
    env: ctx.state.env,
    "query": `db.collection("swiper").where({_id:"${params._id}"}).remove()`
  })
  console.log(data)
  
  // 2.删除云存储的图片
  await axios.post(`https://api.weixin.qq.com/tcb/batchdeletefile?access_token=${ctx.state.access_token}`, {
    env: ctx.state.env,
    fileid_list: [params.fileid]
  })
  ctx.body = data
})

module.exports = router