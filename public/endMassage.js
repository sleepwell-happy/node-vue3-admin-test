function endMassage(data = null, code = 1, msg = "成功") {
  return {
    code: code,     // 状态：1成功 0失败
    msg: msg,       // 提示文字
    data: data,     // 真正的数据
  }
}
module.exports = endMassage