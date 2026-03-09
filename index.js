// 接口的入口文件
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const tj = require("./API/test.js") // 引入接口文件

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

app.listen(3000, () => console.log('服务启动'))
app.use("/tj",tj); // 使用接口文件并给一个访问地址
module.exports=app;
