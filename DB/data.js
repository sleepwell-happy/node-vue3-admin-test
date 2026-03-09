// 引入mysql框架
const mysql = require('mysql')
// 创建连接对象
const option = {
    host: 'localhost', // 连接的数据库的地址，这里我是本机就用localhost代替
    user: 'root',// 用户名 安装数据库时设置的账号
    password: '159357', // 密码 
    port: '3306',  // 数据库端口号
    database: 'nodetest', //数据库名
    connectionTimeout: 1000, // 连接超时事件
    multipleStatements: false, // 一次执行多条sql语句
}
// 创建连接对象 并将对象抛出供其他文件使用
const conn = mysql.createConnection(option)
const DBFun=function(sql,callback){
    connection.query(sql,function(err,result){
        if(err) console.log(err)
        callback(result)
    })
}
module.exports = {conn,DBFun};
