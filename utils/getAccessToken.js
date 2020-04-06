const axios = require('axios')
const fs = require('fs')
const path = require('path')
const {
  AppID,
  AppSecret
} = require('../config/index')

const grant_type = 'client_credential'
const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=${grant_type}&appid=${AppID}&secret=${AppSecret}`
const fileName = path.resolve(__dirname, './access_token.json')


const getAccessToken = async () => {
  try {
    const readRes = fs.readFileSync(fileName, 'utf8')
    const readObj = JSON.parse(readRes)
    const createTime = new Date(readObj.createTime).getTime()
    const nowTime = new Date().getTime()
    if ((nowTime - createTime) / 1000 / 60 / 60 >= 2) {
      await updateAccessToken()
      await getAccessToken()
    }
    return readObj.access_token
  } catch (error) {
    await updateAccessToken()
    await getAccessToken()
  }
 
}

// session 文件 使用redis保存
const updateAccessToken = async () => {
  const result = await axios.get(url)
  if (result.data.access_token) {
    fs.writeFileSync(fileName, JSON.stringify({
      access_token: result.data.access_token,
      createTime: new Date()
    }))
  } else {
    await updateAccessToken()
  }
}

// 提前5分钟获取
setInterval(async () => {
  await updateAccessToken()
}, (7200 - 300) * 1000)

// 接口调用凭证 access_token 有效期2个小时 2000次 缓存
module.exports = getAccessToken