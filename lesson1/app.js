var express = require('express');

var app = express();

/**
 * 通过res对象定制我们向浏览器输出的信息
 */
app.get('/', function(req, res) {
  res.send('Hello world');
});

/**
 * 监听本地的3000端口，在listen动作成功之后会触发回调函数
 */
app.listen(3000, function() {
  console.log('app is listening at port 3000');
});