'use strict'
var mongoose=require('mongoose')
var User=mongoose.model('User')
var Video=mongoose.model('Video')
// var sha1=require('sha1')
var config=require('../../config/config')
var robot=require('../service/robot')
// var uuid=require('uuid')

exports.video=function* (next) {
	var body=this.request.body
	var videoData=body.video
	var user=this.session.user
	if (!videoData||!videoData.key) {
		this.body={
			success:false,
			err:'视频没有上传成功'
		}
		return next
	};

	var video=yield Video.findOne({
		qiniu_key:videoData.key
	}).exec()

	if (!video) {
		// 如果没有视频记录的话，则先保存视频
		video=new Video({
			author:user._id,
			qiniu_key:videoData.key,
			persistentId:videoData.persistentId
		})
		video=yield video.save()
	};

	// 需要将该视频的静音文件异步上传到cloudinary平台
	var url=config.qiniu.video+video.qiniu_key
	console.log("the url is:"+url)
	robot.uploadToCloudinary(url)
			 .then(function(data){
			 	if(data&&data.public_id){
			 		video.public_id=data.public_id
			 		video.detail=data
			 		video.save()
			 	}
			 })


	this.body={
		//将视频的id即视频的地址返还给前端
		success:true,
		data:video._id
	}


}



