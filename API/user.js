const express = require('express')
const { v4: uuidv4 } = require('uuid')
const md5 = require('md5')
const router = express.Router()
const conn = require("../DB/data")  //导入前面写好的数据库连接对象
// const Db = require('../public/javascripts/Db')
const Db = require("../DB/data")  //导入前面写好的数据库连接对象

const endMassage = require('../public/endMassage')
const captcha = require('svg-captcha')



//验证码接口
const options = {
    size: 4,//验证码额度长度
    ignoreChars: '0o1i',//验证码字符中排除0o1i
    fontSize: 34,//验证码的字体大小
    width: 90,//验证码的宽度
    height: 40,//验证码的高度
    background: '#cc9966',//验证码的背景颜色
    color: 'red'
}
const codeStr = ''
router.get('/getCaptchaCode', (req, res) => {
    let code = captcha.create(options)
    codeStr = code.text
    console.log('获取验证码接口', codeStr)
    res.send({
        data: "验证码获取成功", code: code.data, token: md5(codeStr.toUpperCase())
    })
})

router.get('/login', function (req, res, next) {
    console.log('登录接口')
    let token = req.headers.token
    if (!token) res.send({ data: '没用权限', code: 0 })
    let { username, password, code } = req.query
    console.log(username, 'username====')
    console.log(code, md5(code.toUpperCase()), token, "服务端的验证码和前端传送过来的验证码");
    if (token != md5(code.toUpperCase())) {
        res.send({ data: '请输入正确验证码', code: 0 })
    }
    console.log("===========验证码匹配正确============");
    if (!username || !password) {

        res.send(endMassage({
            data: "请输入账号或密码", code: 0
        }))
        return
    }
    let sql = `select username,password,uuid from user where username='${username}'`
    Db.DBFun(sql, (data) => {
        if (data.length) {
            if (data[0].password === md5(password)) {
                console.log("密码正确");
                console.log(String(username).split('').reverse().join(''), 'String(username).split()');
                res.send({
                    data: "登录成功", code: 1, uuidStr: data[0].uuid, token: String(username).split('').reverse().join('') + 'zjjq' + new Date().getTime()
                })
            } else res.send({ data: '密码错误', code: 0 })
        } else {
            let uuidStr = uuidv4()
            let passwordStr = md5(password)
            Db.DBFun(`insert into user(password,username,uuid) values ('${passwordStr}','${username}','${uuidStr}') `, (insertInfo) => {

                res.send(endMassage({
                    data: "注册成功", uuidStr, token: String(username).split('').reverse().join('') + 'zjjq' + new Date().getTime()
                }))
            })
        }
    })
})

//token中间件
router.use((req, res, next) => {
   
  let token = req.headers.token
  if (!token) {
   
    console.log("===没有权限===");
    res.send(endMassage({
    data: "没有权限", code: 0 }))
  }
  let massage;
  let startTime;
  let endTime = new Date().getTime()
  try {
   
    token ? massage = token.split('zjjq')[0].split('').reverse().join('') : massage = '未登录'; //取用户名
  } catch{
   
    res.send(endMassage({
    data: "没有权限", code: 0 }))
  }
  console.log(`**********${
     new Date().toLocaleString()}有人访问接口${
     req.url} ===用户名是：${
     massage}===***********`);
  token ? startTime = token.split('zjjq')[1] : 123
  endTime - startTime > 60 * 1000 * 60 ? res.send(endMassage({
    data: "身份验证过期，请从新登录", code: 0 })) : '' //一小时过期
  console.log("===开始判断是否有权限===");
  if (massage == '未登录') {
   
    console.log("===没有权限===");
    res.send(endMassage({
    data: "没有权限", code: 0 }))
  }
  else {
   
    Db.DBFun(`select username,password,uuid from user where username='${
     massage}'`, (data) => {
   
      if (data.length) {
   
        console.log("===ss有权限===");
        next()
      } else {
   
        console.log("===没用有权限，用户名没有查到===");
        res.send(endMassage({
    data: "没有权限", code: 0 }))
      }
    })
  }
})
