/**
 * 使用eventproxy控制异步并发
 * 使用nodejs爬虫，获取CNode社区首页所有主题标题，链接和第一条评论
 */
var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');

var cnodeUrl = 'https://cnodejs.org/';

superagent.get(cnodeUrl)
  .end(function (err, res) {
    if (err) {
      return console.error(err);
    }
    var topicUrls = [];

    /**
     * res.text里面存储着网页的html内容，将其传给cheerio.load之后
     * 就可以得到一个实现了jquery接口的变量，习惯性将其命名为'$'
     */
    var $ = cheerio.load(res.text);
    $('#topic_list .topic_title').each(function (idx, element) {
      var $element = $(element);
      var href = url.resolve(cnodeUrl, $element.attr('href'));
      topicUrls.push(href);
    });

    console.log(topicUrls);

    var ep = new eventproxy();

    /**
     * 命令ep重复监听topicUrls.length次（在这里也就是40次）`topic_html`事件然后再执行回调函数
     * topics是一个数组，包含40次ep.emit('topic_html', pair)中的40个pair
     */
    ep.after('topic_html', topicUrls.length, function (topics) {
      topics = topics.map(function (topicPair) {
        var topicUrl = topicPair[0];
        var topicHtml = topicPair[1];
        var $ = cheerio.load(topicHtml);
        return ({
          title: $('.topic_full_title').text().trim(),
          href: topicUrl,
          comment1: $('.reply_content').eq(0).text().trim(),
        });
      });

      console.log('final:');
      console.log(topics);
    });

    // 40次'topic_html'事件
    topicUrls.forEach(function (topicUrl) {
      superagent.get(topicUrl)
        .end(function (err, res) {
          console.log('fetch ' + topicUrl + ' successful');
          ep.emit('topic_html', [topicUrl, res.text]);
        });
    });
  });