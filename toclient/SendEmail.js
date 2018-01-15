/**
 * Created by Administrator on 2017/4/14.
 */
//负责发送邮件
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    //https://github.com/andris9/nodemailer-wellknown#supported-services 支持列表
    service: 'qq',
    port: 465, // SMTP 端口
    secureConnection: true, // 使用 SSL
    auth: {
        user: '995199235@qq.com',
        //这里密码不是qq密码，是你设置的smtp密码
        pass: 'lqtwbxlasvmpbfgc'
    }
});
module.exports=function (title, content, address) {
    var mailOptions = {
        from: '995199235@qq.com', // 发件地址
        to: address, // 收件列表
        subject: title, // 标题
        text: content // 标题
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });

};

