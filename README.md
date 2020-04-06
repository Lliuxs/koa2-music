1. 接口调用凭证
 - auth.getAccessToken
 - GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

2. http触发云函数
  - invokeCloudFunction
  - POST https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=ACCESS_TOKEN&env=ENV&name=FUNCTION_NAME

3. 数据库
  增删改查

4. 存储
  网页不支持云文件id 获取文件上传下载连接
