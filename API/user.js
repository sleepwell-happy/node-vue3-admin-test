const express = require('express')
const { v4: uuidv4 } = require('uuid')
const md5 = require('md5')
const router = express.Router()
// const conn = require("../DB/data")  //导入前面写好的数据库连接对象
// const Db = require('../public/javascripts/Db')
const Db = require("../DB/data")  //导入前面写好的数据库连接对象
const captcha = require('svg-captcha')
const {buildMenuTree}=require('../utils/tree')




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
let codeStr = ''
router.get('/getCaptchaCode', (req, res) => {
    let code = captcha.create(options)
    codeStr = code.text
    console.log('获取验证码接口', codeStr)
    // res.send({
    //     data: "验证码获取成功", code: code.data, token: md5(codeStr.toUpperCase())
    // })
    res.success({image:code.data,token:md5(codeStr.toUpperCase())},"验证码获取成功")
})
//登录接口
router.post('/login', function (req, res) {
    // console.log('登录接口')
    let token = req.headers.authorization
    // if (!token) res.send({ data: '没用权限', code: 0 })
    let { username, password, captcha } = req.body
    console.log(username, 'username====')
    console.log(captcha, md5(captcha.toUpperCase()), token, "服务端的验证码和前端传送过来的验证码");
     if (!captcha || !token) {
        return res.error(null,'验证码或token不能为空',419)

    }
    if (token != md5(captcha.toUpperCase())) {
        return res.error(null,'请输入正确验证码',419)
    }
    console.log("===========验证码匹配正确============");
    if (!username || !password) {
        return res.error(null,'请输入账号或密码',419)
    }
    let sql = `select username,password,uuid from user where username='${username}'`
    Db.DBFun(sql, (err,data) => {
        if (data?.length) {
            if (data[0].password === md5(password)) {
                console.log("密码正确");
                console.log(String(username).split('').reverse().join(''), 'String(username).split()');
                // res.send({data: "登录成功", code: 1, uuidStr: data[0].uuid, token: String(username).split('').reverse().join('') + 'zjjq' + new Date().getTime()})
                let params={uuidStr: data[0].uuid, token: String(username).split('').reverse().join('') + 'zjjq' + new Date().getTime()}
                res.success(params,"登录成功")
            } else res.error(null, '密码错误',419)
        } else {
            res.error(null, '账号或密码错误！请重试！',419)
            // let uuidStr = uuidv4()
            // let passwordStr = md5(password)
            // Db.DBFun(`insert into user(password,username,uuid) values ('${passwordStr}','${username}','${uuidStr}') `, (insertInfo) => {
            //     let params={uuidStr:uuidStr,token: String(username).split('').reverse().join('') + 'zjjq' + new Date().getTime()}
            //     res.success(params,"注册成功")
            //     // res.send({data: "注册成功", uuidStr, token: String(username).split('').reverse().join('') + 'zjjq' + new Date().getTime()})
            // })
        }
    })
})
//菜单接口
router.get('/getMenuList',(req,res)=>{
    //1.从数据库中插所有菜单
    // const sql = `select * from sys_menu`
     const sql = `select * from sys_menu order by \`order\` asc`

    Db.DBFun(sql,(err,data)=>{
        if(err){
            return res.error(null,'查询菜单失败')
        }
        const menuTree=buildMenuTree(data,null)

        return res.success(menuTree,'获取菜单成功')
    })
})

//用户信息接口
router.post('/getUserInfo',(req,res)=>{
    let { username } = req.body
     const userSql = `
    SELECT 
      u.id, u.username, u.enable, 
      DATE_FORMAT(u.create_time, '%Y-%m-%dT%H:%i:%s.%fZ') AS createTime,
      DATE_FORMAT(u.update_time, '%Y-%m-%dT%H:%i:%s.%fZ') AS updateTime,
      r.id AS currentRoleId, r.code AS currentRoleCode, r.name AS currentRoleName, r.enable AS currentRoleEnable
    FROM sys_user u
    LEFT JOIN sys_role r ON u.current_role_id = r.id
    WHERE u.username = ?
  `
   Db.DBFun(userSql, [username], (userErr, userResult) => {
    if (userErr || userResult.length === 0) {
      return res.error(null, "用户不存在", 404)
    }

    const user = userResult[0]
    const userInfo = {
      id: user.id,
      username: user.username,
      enable: user.enable,
      createTime: user.createTime,
      updateTime: user.updateTime,
      // 拼接当前角色
      currentRole: {
        id: user.currentRoleId,
        code: user.currentRoleCode,
        name: user.currentRoleName,
        enable: user.currentRoleEnable
      }
    }

        // 2. 查询用户资料
    const profileSql = `
      SELECT id, nick_name AS nickName, gender, avatar, email, address, user_id AS userId
      FROM sys_user_profile WHERE user_id = ?
    `
    Db.DBFun(profileSql, [user.id], (profileErr, profileResult) => {
      if (profileErr) {
        return res.error(null, "查询用户资料失败", 500)
      }
      userInfo.profile = profileResult.length > 0 ? profileResult[0] : null

      // 3. 查询用户所有角色
      const rolesSql = `
        SELECT r.id, r.code, r.name, r.enable
        FROM sys_user_role ur
        LEFT JOIN sys_role r ON ur.role_id = r.id
        WHERE ur.user_id = ?
      `
      Db.DBFun(rolesSql, [user.id], (rolesErr, rolesResult) => {
        if (rolesErr) {
          return res.error(null, "查询用户角色失败", 500)
        }
        userInfo.roles = rolesResult

        // 4. 返回最终拼接的数据
        res.success(userInfo, "获取用户信息成功")
      })
    })
  })
})
module.exports = router