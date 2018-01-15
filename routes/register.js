var express = require('express');
var router = express.Router();
var registHelper=require('../dao/RegistHelper');
//var contentHelper=require('../dao/ContentHelper');
var sendemail=require('../toclient/SendEmail');
var UUID = require('node-uuid');
var fs=require('fs');
router.post('/', function(req, res, next) {
  var method=req.header('method');
  console.log(method);
  if (method=='getEmail'){
      var address=req.body.address;
      console.log('post:body:'+address);
      var randomnum=parseInt(Math.random()*8999+1000);
      //首先要判断是否已经注册过
      registHelper.insertToRegisterTable(address,randomnum,function (callback) {
          if (callback){
              console.log('发送邮件:'+randomnum);
              sendemail('app注册验证码','您的注册验证码为：'+randomnum+'   请妥善保管谨防泄露',address);
              res.send('sucsess');
          }else {
              console.log('该邮箱已经注册');
              res.send('fail');
          }
      });
  }else if (method=='register'){
      var address=req.body.address;
      var pwd=req.body.pwd;
      var num=req.body.num;
      var username=req.body.username;
      console.log('register:'+address+"  "+pwd+'   '+num+'   '+username);
      //首先判断验证码是否相等
      registHelper.checkNum(address,num,username,function (callback) {
          if (callback){

              res.send('registersuccess');

              console.log("验证码正确");

              var uuid='u'+UUID.v1().replace(/-/g,'');
              console.log(uuid);

              //插入进数据库
              registHelper.insertToUsersTable(address,pwd,uuid,username);

              //在Content数据库中创建对应的table
              //contentHelper.createTable(uuid);

              //创建该用户对应的个人文件夹用于存储相应的个人上传的图片文档等资料
              /*fs.mkdir("C:/Sp/WorkPlace/Passages/"+uuid+"/",function (err) {
                  if (err){
                      return console.error(err);
                  }
                  console.log('目录创建成功');
              })*/
          }else {
              console.log("注册失败");
              res.send('error');
          }
      });
  }else if (method=='login'){
      var address=req.body.address;
      var pwd=req.body.pwd;
      console.log('login:'+address+"  "+pwd);
      registHelper.checkLoginResult(address,pwd,function (callback) {
          if (callback){
              console.log("登陆成功");
              registHelper.getUUID(address,function (uuid) {
                  res.send(uuid);
              });
          }else {
              res.send('loginFail');
          }
      })
  }
});

module.exports = router;
