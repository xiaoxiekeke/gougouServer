'use strict'
var mongoose=require('mongoose')
var User=mongoose.model('User')
var Video=mongoose.model('Video')
var Audio=mongoose.model('Audio')
var Promise=require('bluebird')
// var sha1=require('sha1')
var config=require('../../config/config')
var robot=require('../service/robot')
// var uuid=require('uuid')

function asyncMedia(videoId,audioId){
	if(!videoId) return
	console.log(videoId)
	console.log(audioId)
	var query={
		_id:audioId
	}
	if (!audioId) {
		query={
			video:videoId
		}
	};
	Promise.all([
		Video.findOne({_id:videoId}).exec(),
		Audio.findOne(query).exec()
	]).then(function(data){
		console.log(data)
		var video=data[0]
		var audio=data[1]
		console.log('检查数据有效性')
		if (!video||!video.public_id||!audio||!audio.public_id) {
			return
		}
		console.log('开始同步音视频')
		var video_public_id=video.public_id;
		var audio_public_id=audio.public_id.replace('/',':');
		var videoName=video_public_id.replace('/','_')+'.mp4'
		var videoURL='https://res.cloudinary.com/xiaoke/video/upload/'+'e_volume:-100/e_volume:400,l_video:'+audio_public_id+'/'+video_public_id+'.mp4'
		var thumbName=video_public_id.replace('/','_')+'.jpg'
		var thumbURL ='https://res.cloudinary.com/xiaoke/video/upload/'+video_public_id+'.jpg'

		console.log('将生成的封面和视频同步到七牛')
		robot
				.saveToQiniu(videoURL,videoName)
				.catch(function(err){
				 	console.log(err)
				 })
				.then(function(response){
				 	if(response&&response.key){
				 		audio.qiniu_video=response.key
				 		audio.save().then(function(_audio){
				 			console.log(_audio)
				 			console.log('同步视频成功')
				 		})
				 	}
				})

		robot
				.saveToQiniu(thumbURL,thumbName)
				.catch(function(err){
				 	console.log(err)
				 })
				.then(function(response){
				 	if(response&&response.key){
				 		audio.qiniu_thumb=response.key
				 		audio.save().then(function(_audio){
				 			console.log(_audio)
				 			console.log('同步封面成功')
				 		})
				 	}
				})
	})	
	

}

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
	console.log("the qiniu_video url is:"+url)
	robot.uploadToCloudinary(url)
			 .then(function(data){
			 	if(data&&data.public_id){
			 		video.public_id=data.public_id
			 		video.detail=data
			 		video.save().then(function(_video){
			 			asyncMedia(_video.id)
			 		})
			 	}
			 })


	this.body={
		//将视频的id即视频的地址返还给前端
		success:true,
		data:video._id
	}


}

exports.audio=function* (next) {
	var body=this.request.body
	var audioData=body.audio
	var videoId=body.videoId
	var user=this.session.user
	if (!audioData||!audioData.public_id) {
		this.body={
			success:false,
			err:'音频没有上传成功'
		}
		return next
	};

	var audio=yield Audio.findOne({
		public_id:audioData.public_id
	}).exec()

	var video=yield Video.findOne({
		_id:videoId
	}).exec()

	if (!audio) {
		// 如果没有音频记录的话，则先保存音频
		var _audio={
			author:user._id,
			public_id:audioData.public_id,
			detail:audioData
		}
		if (video) {
			_audio.video=video._id
		}

		audio=new Audio(_audio)
		audio=yield audio.save()
	};

	// 异步操作，将视频和音频同步到cloudinary,进行合并
	asyncMedia(video._id,audio._id);

	this.body={
		//将音频的id即音频的地址返还给前端
		success:true,
		data:audio._id
	}


}



