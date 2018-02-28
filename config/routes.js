'use strict'
var Router= require('koa-router')
var User=require('../app/controllers/user')
var App=require('../app/controllers/app')
var Creation=require('../app/controllers/creations')
var Comment=require('../app/controllers/comment')
module.exports=function(){
  var router = new Router({
    prefix:'/api'
  })
  router.post('/u/signup',App.hasBody,User.signup)
  router.post('/u/verify',App.hasBody,User.verify)
  router.post('/u/update',App.hasBody,App.hasToken,User.update)
  router.post('/signature',App.hasBody,App.hasToken,App.signature)

  router.post('/creations/video',App.hasBody,App.hasToken,Creation.video)
  router.post('/creations/audio',App.hasBody,App.hasToken,Creation.audio)
  router.post('/creations',App.hasBody,App.hasToken,Creation.save)
  router.get('/creations',App.hasToken,Creation.find)
  router.post('/comments',App.hasBody,App.hasToken,Comment.save)
  router.get('/comments',App.hasToken,Comment.find)
  router.post('/up',App.hasBody,App.hasToken,Creation.up)
  return router
}
