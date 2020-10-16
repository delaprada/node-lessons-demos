var async = require('async');

// 并发连接数的计数器
var concurrencyCount = 0;

/**
 * fetchUrl通常情况下是一些用来发起请求的方法
 * callback就是将请求得到的结果传给这个回调函数，使得async的回调函数可以获得这些结果
 */
var fetchUrl = function(url, callback) {
  var delay = parseInt((Math.random()*10000000%2000, 10));
  concurrencyCount++;
  console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
  setTimeout(function() {
    concurrencyCount--;
    callback(null, url+ ' html content');
  }, delay);
};

var urls = [];
for(let i = 0; i < 30; ++i) {
  urls.push('http://datasource_' + i);
}

async.mapLimit(urls, 5, function(url, callback) {
  fetchUrl(url, callback);
}, function(err, result) {
  console.log('final:');
  console.log(result);
});