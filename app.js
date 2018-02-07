'use strict'
var fs =require('fs')
var path =require('path')

// 使用mongoose连接mongodb
var mongoose =require('mongoose')
var db ='mongodb://gougou-runner:1qaz2wsx@localhost:19999/gougouServer'
// mongodb://blog-runner:1qaz2wsx@localhost:19999/myblog
mongoose.Promise=require('bluebird')
mongoose.connect(db);

//遍历模型文件所在的目录
var models_path=path.join(__dirname,'/app/models')
var walk = function(modelPath){
  fs
    .readdirSync(modelPath)
    .forEach(function(file){
      var filePath = path.join(modelPath,'/'+file)
      var stat = fs.statSync(filePath)

      if (stat.isFile()) {//判断是否文件
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(filePath)
        }
      }else if(stat.isDirectory()){//判断是否文件夹
        walk(filePath)
      }
    })
}
walk(models_path)


var koa = require('koa')
var logger= require('koa-logger')
var session= require('koa-session')

var bodyParser= require('koa-bodyparser')
var app = koa()

app.keys=['imooc']
app.use(logger())
app.use(session(app))
app.use(bodyParser())
var router= require('./config/routes')()
app.use(router.routes())
   .use(router.allowedMethods())
app.listen(8084)
console.log('listen 8084')
