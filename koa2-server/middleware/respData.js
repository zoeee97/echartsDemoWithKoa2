const path = require('path')
const file = require('../utils/file')
module.exports = async (ctx,next)=>{
  /* 把请求路径/api/文件名 替换成真实的绝对路径 */
  const url = ctx.request.url;
  let filePath = '../data'+url.replace('/api','')+'.json';
  // path模块处理路径
  filePath = path.join(__dirname,filePath)
  try{
    const ret = await file.getFileJsonData(filePath);
    // 把数据放到响应体返回
    ctx.response.body = ret;
  }catch(e){
    const errorMsg = {
      message:'读取文件内容失败，文件资源不存在',
      status:404
    }
    ctx.response.body = JSON.stringify(errorMsg)
  }
  await next();
}