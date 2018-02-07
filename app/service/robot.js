'use strict'

var qiniu = require('qiniu')
var config=require('../../config/config')

var sha1=require('sha1')
var uuid=require('uuid')

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
		putPolicy=new qiniu.rs.PutPolicy2(options);
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
  signature = sha1(signature)
  return signature;
}

