const path = require('path')
const file = require('../utils/file')
const WebSorket = require('ws');

const ws = new WebSorket.Server({
  port:9998
})

module.exports.listen = ()=>{
  ws.on("connection",client=>{
    // 监听客户端向服务器端发送数据
    client.on('message',async msg=>{
      // 把接收到的buffer对象转成json对象
      let payload = JSON.parse(msg)
      const action = payload.action
      if(action==='getData'){
        let filePath = `../data/${payload.chartName}.json`
        filePath = path.join(__dirname,filePath)
        const result = await file.getFileJsonData(filePath)
        payload.data = result;
        client.send(JSON.stringify(payload))
      }else{
        ws.clients.forEach(client=>{
          // 转回json字符串发送给客户端
          client.send(JSON.stringify(payload))
        })
      }
    })
  })
}