'use strict'

var qiniu = require('qiniu')
var cloudinary = require('cloudinary')
var config=require('../../config/config')
var Promise=require('bluebird')
var sha1=require('sha1')
var uuid=require('uuid')

cloudinary.config(config.cloudinary)

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = config.qiniu.AK;
qiniu.conf.SECRET_KEY = config.qiniu.SK;
var mac = new qiniu.auth.digest.Mac(config.qiniu.AK, config.qiniu.SK);

//要上传的空间
// var bucket = 'gougouavatar';

//上传到七牛后保存的文件名
// key = 'my-nodejs-logo.png';

exports.getQiniuToken=function(body){
	var type=body.type
	var putPolicy
	var key=uuid.v4()
	var options = {
    persistentNotifyUrl: config.notify
  }

	if(type=='avatar'){
		key+='.jepg'
		putPolicy = new qiniu.rs.PutPolicy({scope:'gougouavatar:' + key})
	}else if(type=='video'){
		key+='.mp4'
		options.scope='gougouvideo:'+key
		options.persistentOps='avthumb/mp4/an/1'
		putPolicy=new qiniu.rs.PutPolicy(options);
	}else if(type=='audio'){
		
	}
	var token=putPolicy.uploadToken(mac)
	return {
		token:token,
		key:key
	};
}

exports.getCloudinaryToken=function(body){
	var type=body.type
	var timestamp=body.timestamp
	var folder
	var tags

	if (type==='avatar') {
		folder='avatar'
		tags='app,avatar'
	} else if (type==='video'){
		folder='video'
		tags='app,video'
	} else if (type==='audio'){
		folder='audio'
		tags='app,audio'
	}

	var signature = 'folder=' + folder + '&tags=' + tags + '&timestamp=' + timestamp + config.cloudinary.api_secret
  var key=uuid.v4()
  signature = sha1(signature)
  return {
  	token:signature,
  	key:key
  };
}

exports.uploadToCloudinary=function(url){
	return new Promise(function(resolve,reject){
		cloudinary.uploader.upload(url,function(result){
			if (result&&result.public_id) {
				resolve(result)	
			}else{
				reject(result)
			}
		},{
			resource_type:'video',
			folder:'video'
		})
	})
}

//将cloudinary生成好的封面和视频同步到七牛
exports.saveToQiniu=function(url,key){
	var config = new qiniu.conf.Config();
	config.zone = qiniu.zone.Zone_z0;
	var bucketManager = new qiniu.rs.BucketManager(mac, config);
	// var client=new qiniu.rs.Client()
	return new Promise(function(resolve,reject){
		bucketManager.fetch(url,'gougouvideo', key, function(err, ret) {
		  // if (err) {
		  //   console.log(err);
		  //   //throw err;
		  // } else {
		  //   if (respInfo.statusCode == 200) {
		  //     console.log(respBody.hash);
		  //     console.log(respBody.fsize);
		  //     console.log(respBody.mimeType);
		  //     console.log(respBody.putTime);
		  //     console.log(respBody.type);
		  //   } else {
		  //     console.log(respInfo.statusCode);
		  //     console.log(respBody.error);
		  //   }
		  // }
		  if(err){
		  	reject(err)
		  }else{
		  	resolve(ret)
		  }
		});
		// client.fetch(url,'gougouvideo',key,function(err,ret){
		// 	if(err){
		// 		reject(err)
		// 	}else{
		// 		resolve(ret)
		// 	}
		// })
	})
}










