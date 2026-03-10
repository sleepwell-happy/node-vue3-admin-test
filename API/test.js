const express = require('express') // 引入express框架
const Db = require("../DB/data")  //导入前面写好的数据库连接对象
const router = express.Router()  // 创建路由对象
const auth=require('./auth')
// 编写一个测试接口
router.post("/test",(req,res)=>{
    // let table_name=req.body.table_name
    let sql=`select * from user`
    // Db.conn.query(sql,(err,result)=>{
    //     if(err){
    //         res.send(err).end()
    //     }else{
    //         res.json({code:200,data:result}).end()
    //     }
    // })
    Db.DBFun(sql,(err,data)=>{
        if(err){
            console.log("查询错误：",err)
            return res.error(null,"查询失败",500)
        }
        //成功
        return res.success(data,"获取成功",200)
    })
})
module.exports = router;

