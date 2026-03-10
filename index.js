// 接口的入口文件
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')//配置解析json请求体
const tj = require("./API/test.js") // 引入接口文件
const user=require("./API/user.js")
const Db=require('./DB/data.js')
// const { success } = require('./utils/response.js')


// app.use(bodyParser.json())
app.use(bodyParser.json({
  limit: '1mb', // 增加请求体大小限制，避免大请求解析失败
  strict: true // 严格解析 JSON，避免格式不规范的请求
}))
// 解析表单请求体（extended: true 支持复杂对象，统一值
app.use(bodyParser.urlencoded({extended:true}))


// 开启连接提示
Db.conn.connect((err) => {
   if (err) {
        console.log('连接失败')
        return;
    };
    console.log('连接成功')
})
app.use((req,res,next)=>{
    res.success=(data=null,msg="操作成功",code=200)=>{
        return res.json({
            code,
            data,
            msg,
            success:true
        })
    }
    res.error=(data=null,msg="操作失败",code=500)=>{
        return res.json({
            code,
            data,
            msg,
            success:false,
        })
    }
    next()
})

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.listen(3000, () => console.log('服务启动'))
app.use("/tj",tj); // 使用接口文件并给一个访问地址
app.use("/user",user)


module.exports=app;
