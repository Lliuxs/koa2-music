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
  上传的格式 rp库 formData axios如何实现
  删除云数据库的时候需要同时删除云存储的内容
  删除云数据库信息同时要删除关联的数据(blog中的评论)

5. 服务端http操作的数据没有openid注意小程序云数据库中的权限
