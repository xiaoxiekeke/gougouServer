// 'use strict'
// var mongoose=require('mongoose')

// var UserSchema=new mongoose.Schema({
//   // phoneNumber:{
//   //   unique: true,
//   //   type:String
//   // },
//   phoneNumber:String,
//   areaCode:String,
//   verifyCode:String,
//   verified:{
//     type:Boolean,
//     default:false
//   },
//   accessToken:String,
//   nickname:String,
//   gender:String,
//   breed:String,
//   age:String,
//   avatar:String,
//   meta:{
//     createAt:{
//       type:Date,
//       default:Date.now()
//     },
//     updateAt:{
//       type:Date,
//       default:Date.now()
//     }
//   }
// })

// UserSchema.pre('save',function(next){
//   if (this.isNew) {
//     this.meta.createAt = this.meta.updateAt=Date.now()
//   }else {
//     this.meta.updateAt=Date.now()
//   }
//   next()
// })

// // model由Schema构造生成的模型，除了Schema定义的数据库骨架以外，还具有数据库操作的行为，类似于管理数据库属性、行为的类。
// module.exports= mongoose.model('User',UserSchema)




'use strict'

var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
  phoneNumber: {
    unique: true,
    type: String
  },
  areaCode: String,
  verifyCode: String,
  verified: {
    type: Boolean,
    default: false
  },
  accessToken: String,
  nickname: String,
  gender: String,
  breed: String,
  age: String,
  avatar: String,
  meta: {
    createAt: {
      type: Date,
      dafault: Date.now()
    },
    updateAt: {
      type: Date,
      dafault: Date.now()
    }
  }
})

UserSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

module.exports = mongoose.model('User', UserSchema)
