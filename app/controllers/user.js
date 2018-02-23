'use strict'
var mongoose=require('mongoose')
var xss=require('xss')
// 引入User model
var User = mongoose.model('User')
var uuid=require("uuid")
var sms=require('../service/sms')


//注册
exports.signup=function *(next) {

  //从数据库中查找当前phoneNumber的用户
  var phoneNumber=xss(this.request.body.phoneNumber.trim())

  if(!phoneNumber){
    this.body={
      success:false,
      err:'请输入手机号'
    }
    return next
  }

  // var phoneNumber=this.query.phoneNumber
  var user = yield User.findOne({
    phoneNumber:phoneNumber
  }).exec()


  var verifyCode=sms.getCode()

  //如果用户不存在则创建新用户,若存在，则设置verifyCode
  if (!user) {
    var accessToken=uuid.v4()
    //创建Entity：由Model创建的实体，使用save方法保存数据
    user = new User({
      nickname:'小狗宝',
      phoneNumber:xss(phoneNumber),
      avatar:'http://res.cloudinary.com/xiaoke/image/upload/v1516267703/avatar/s3mjsfkzulpubzc0sk0k.jpg',
      verifyCode:verifyCode,
      accessToken:accessToken,
    })
  }else {
    user.verifyCode = verifyCode
  }

  try {
    user=yield user.save()
    //使用Entity的save方法保存数据
  } catch (e) {
    this.body={
      success:false
    }
    return next
  }
  
  var msg='您的注册验证码是：'+user.verifyCode
  // try{
  //   sms.send(user.phoneNumber,msg)    
  // }
  // catch(e){
  //   this.body={
  //     success:false,
  //     err:'短信服务异常'
  //   }
  //   return next
  // }

  this.body={
    success:true,
    msg:msg
  }

}

//验证
exports.verify=function *(next) {

  var verifyCode=this.request.body.verifyCode
  var phoneNumber=this.request.body.phoneNumber

  if(!verifyCode||!phoneNumber){
    this.body={
      success:false,
      err:'验证未通过'
    }
    return next
  }

  var user = yield User.findOne({
    phoneNumber:phoneNumber,
    verifyCode:verifyCode
  })

  if(user){
    user.verified=true
    user=yield user.save()

    this.body={
      success:true,
      data:{
        nickname:user.nickname,
        accessToken:user.accessToken,
        avatar:user.avatar,
        _id:user._id
      }
    }
  }else{
    this.body={
      success:false,
      err:'验证未通过'
    }
  }
}



// 更新
exports.update=function *(next) {
  var body=this.request.body
  console.log(body)
  var accessToken=body.accessToken

  var user=this.session.user;

  var fields='avatar,gender,age,nickname,breed'.split(',');

  fields.forEach(function(field){
    if(body[field]){
      user[field]=xss(body[field].trim())
    }
  })

  user=yield user.save()

  this.body={
    success:true,
    data:{
      nickname:user.nickname,
      accessToken:user.accessToken,
      avatar:user.avatar,
      age:user.age,
      breed:user.breed,
      gender:user.gender,
      _id:user._id
    }
  }
}



// 'use strict'

// var xss = require('xss')
// var mongoose = require('mongoose')
// var User = mongoose.model('User')
// var uuid = require('uuid')
// var sms = require('../service/sms')


// exports.signup = function *(next) {
//   var phoneNumber = xss(this.request.body.phoneNumber.trim())

//   var user = yield User.findOne({
//     phoneNumber: phoneNumber
//   }).exec()

//   var verifyCode = sms.getCode()

//   if (!user) {
//     var accessToken = uuid.v4()

//     user = new User({
//       nickname: '小狗宝',
//       avatar: 'http://res.cloudinary.com/gougou/image/upload/mooc1.png',
//       phoneNumber: xss(phoneNumber),
//       verifyCode: verifyCode,
//       accessToken: accessToken
//     })
//   }
//   else {
//     user.verifyCode = verifyCode
//   }

//   try {
//     user = yield user.save()
//   }
//   catch (e) {
//     this.body = {
//       success: false
//     }

//     return next
//   }

//   var msg = '您的注册验证码是：' + user.verifyCode

//   try {
//     sms.send(user.phoneNumber, msg)
//   }
//   catch (e) {
//     console.log(e)

//     this.body = {
//       success: false,
//       err: '短信服务异常'
//     }

//     return next
//   }

//   this.body = {
//     success: true
//   }
// }
// exports.signup=function *(next) {

//   //从数据库中查找当前phoneNumber的用户
//   var phoneNumber=xss(this.request.body.phoneNumber.trim())

//   if(!phoneNumber){
//     this.body={
//       success:false,
//       err:'请输入手机号'
//     }
//     return next
//   }

//   // var phoneNumber=this.query.phoneNumber
//   var user = yield User.findOne({
//     phoneNumber:phoneNumber
//   }).exec()


//   var verifyCode=sms.getCode()

//   //如果用户不存在则创建新用户,若存在，则设置verifyCode
//   if (!user) {
//     var accessToken=uuid.v4()
//     //创建Entity：由Model创建的实体，使用save方法保存数据
//     user = new User({
//       nickname:'小狗宝',
//       phoneNumber:xss(phoneNumber),
//       avatar:'http://res.cloudinary.com/xiaoke/image/upload/v1516267703/avatar/s3mjsfkzulpubzc0sk0k.jpg',
//       verifyCode:verifyCode,
//       accessToken:accessToken,
//     })
//   }else {
//     user.verifyCode = verifyCode
//   }

//   try {
//     user=yield user.save()
//     //使用Entity的save方法保存数据
//   } catch (e) {
//     this.body={
//       success:false
//     }
//     return next
//   }
  
//   var msg='您的注册验证码是：'+user.verifyCode
//   // try{
//   //   sms.send(user.phoneNumber,msg)    
//   // }
//   // catch(e){
//   //   this.body={
//   //     success:false,
//   //     err:'短信服务异常'
//   //   }
//   //   return next
//   // }

//   this.body={
//     success:true,
//     msg:msg
//   }

// }

// exports.verify = function *(next) {
//   var verifyCode = this.request.body.verifyCode
//   var phoneNumber = this.request.body.phoneNumber

//   if (!verifyCode || !phoneNumber) {
//     this.body = {
//       success: false,
//       err: '验证没通过'
//     }

//     return next
//   }

//   var user = yield User.findOne({
//     phoneNumber: phoneNumber,
//     verifyCode: verifyCode
//   }).exec()

//   if (user) {
//     user.verified = true
//     user = yield user.save()

//     this.body = {
//       success: true,
//       data: {
//         nickname: user.nickname,
//         accessToken: user.accessToken,
//         avatar: user.avatar,
//         _id: user._id
//       }
//     }
//   }
//   else {
//     this.body = {
//       success: false,
//       err: '验证未通过'
//     }
//   }
// }

// exports.update = function *(next) {
//   var body = this.request.body
//   var user = this.session.user
//   var fields = 'avatar,gender,age,nickname,breed'.split(',')

//   fields.forEach(function(field) {
//     if (body[field]) {
//       user[field] = xss(body[field].trim())
//     }
//   })

//   user = yield user.save()

//   this.body = {
//     success: true,
//     data: {
//       nickname: user.nickname,
//       accessToken: user.accessToken,
//       avatar: user.avatar,
//       age: user.age,
//       breed: user.breed,
//       gender: user.gender,
//       _id: user._id
//     }
//   }
// }


