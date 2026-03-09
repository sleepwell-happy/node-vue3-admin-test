const express = require('express') // 引入express框架
const Db = require("../DB/data")  //导入前面写好的数据库连接对象
const router = express.Router()  // 创建路由对象
// 开启连接提示
conn.connect((err) => {
   if (err) {
        console.log('连接失败')
        return;
    };
    console.log('连接成功')
})
// 编写一个测试接口
router.post("/user/test",(req,res)=>{
    // let table_name=req.body.table_name
    let sql=`select * from user`
    Db.conn.query(sql,(err,result)=>{
        if(err){
            res.send(err).end()
        }else{
            res.json({code:200,data:result}).end()
        }
    })
})
module.exports = router;

