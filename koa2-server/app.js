// 服务器入口文件
const respDuration = require('./middleware/respDuration')
const respHeader = require('./middleware/respHeader')
const respData = require('./middleware/respData')
// 1.创建koa对象
const Koa = require('koa');
const app = new Koa()
// 2.编写响应函数（中间件
// context是上下文，web容器
// next是下一个中间件，执行的话要调用next函数
app.use(respDuration)
app.use(respHeader)
app.use(respData)

// 3.监听端口号
app.listen(8082,()=>{
  console.log("Server start at:8082");
})


const WebSocketService = require('./service/wsService')
// 开启服务端的监听，监听客户端的连接
// 当某一个客户端连接成功之后，就会对这个客户端进行 message 事件的监听
WebSocketService.listen()
