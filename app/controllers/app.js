'use strict'
var mongoose=require('mongoose')
var User=mongoose.model('User')
// var sha1=require('sha1')
// var config=require('../../config/config')
var robot=require('../service/robot')
var uuid=require('uuid')

exports.signature=function* (next) {
	var body=this.request.body
	var cloud=body.cloud
	var data
	if(cloud==='qiniu'){//七牛	
		data=	robot.getQiniuToken(body)
	}else{//Cloudinary
		data=robot.getCloudinaryToken(body)
	}

  this.body={
    success:true,
    data:data
  }
}

exports.hasBody=function* (next){
	var body=this.request.body||{}
	if(Object.keys(body).length===0){
		this.body={
			success:false,
			err:'是不是漏掉了什么'
		}
		return next
	}
	yield next
}

exports.hasToken=function* (next) {
	var accessToken=this.query.accessToken
	if(!accessToken){
		var accessToken=this.request.body.accessToken
	}
	if(!accessToken){
		this.body={
	    success:false,
	    err:'钥匙丢了'
	  }
	  return next
	}

	var user=yield User.findOne({
		accessToken:accessToken
	}).exec()

	if(!user){
		this.body={
			success:false,
			err:'用户没登陆'
		}
		return next
	}

	this.session=this.session||{}
	this.session.user=user
	
	yield next
}

