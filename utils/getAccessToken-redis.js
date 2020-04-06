const axios = require('axios')
const Redis = require('koa-redis');
const Store = new Redis().client;
const {
  AppID,
  AppSecret
} = require('../config/index')

const grant_type = 'client_credential'
const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=${grant_type}&appid=${AppID}&secret=${AppSecret}`


const getAccessToken = async () => {
  const access_token = await Store.get('access_token')
  // console.log(access_token, 'access_token')
  if(access_token) {
    return access_token
  } else {
    await updateAccessToken()
    await getAccessToken()
  }
}

const updateAccessToken = async () => {
  const result = await axios.get(url)
  if (result.data.access_token) {
    await Store.set('access_token', result.data.access_token)
    await Store.expire('access_token', '7200')
  } else {
    await updateAccessToken()
  }
}

// 服务器上执行定时任务
// setInterval(async () => {
//   await updateAccessToken()
// }, (7200 - 300) * 1000)

// 接口调用凭证 access_token 有效期2个小时 2000次 缓存 提前5分钟更新
module.exports = getAccessToken