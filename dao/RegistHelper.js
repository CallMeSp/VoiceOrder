/**
 * Created by Administrator on 2017/4/16.
 */

var mysql= require('mysql');
var connection=mysql.createConnection({
    host: "127.0.0.1",
    user: 'root',
    password: 'sp123456',
    database: 'voicetest'
});
connection.connect(function (err) {
   if (err){
       console.error(err);
       return;
   }
   console.log("voicetest connect id is "+connection.threadId);
});
var insertToRegister=function (address, num) {
    var content=[address,num];
    connection.query('INSERT INTO toregister (emailaddress,checknum) VALUES(?,?)',content);
};
var queryFromDbToInsert=function (address, num, callback) {
    connection.query('SELECT * from users where emailaddress=?',address,function (err, result, field) {
        if (err) throw err;
        if (result.length>0){
            //已经注册过了
            callback(false);
        }else {
            callback(true);
            connection.query('SELECT * from toregister where emailaddress=?',address,function (error, results, fields) {
                if (error) throw error;
                if(results.length>0){
                    var content=[num,address];
                    connection.query( 'UPDATE toregister SET checknum = ? WHERE emailaddress = ?',content,function (err, result) {
                        if (err) {
                            console.log('[UPDATE ERROR] - ', err.message);
                            return;
                        }
                        console.log('----------UPDATE-------------');
                        console.log('UPDATE affectedRows', result.affectedRows);
                        console.log('******************************');
                    });
                }else {
                    insertToRegister(address,num);
                }
            });
        }
    });
};
var insertToUsers=function (address, pwd,uuid,username) {
    var content=[address,pwd,uuid,username];
    connection.query('select * from users where emailaddress=?',address,function (err, results, field) {
        if (results.length>0){
            //已经存在了
        }else {
            connection.query('INSERT INTO users (emailaddress,password,uuid,username) VALUES(?,?,?,?)',content);
        }
    });

};
var queryFromRegisterForNum=function (address,num,username,callback) {
    var content=[address,username];
    connection.query('select * from users where emailaddress=? or username=?',content,function (err, results, field) {
        if (results.length>0){
            callback(false);
        }else {
            connection.query('SELECT * from toregister where emailaddress=?',address,function (err, result, field) {
                if (err) throw  err;
                var checknum=result[0].checknum;
                if (num==checknum){
                    callback(true);
                }else {
                    callback(false);
                }
            });
        }
    });
};
var checkLogin=function (address, pwd, callback) {
    connection.query('select * from users where emailaddress=?',address,function (err, result, field) {
        if (err) throw err;
        if (result.length==0){
            callback(false);
        }else {
            console.log(pwd+'  '+result[0].password);
            var password=result[0].password;
            if (pwd==password){
                callback(true);
            }else {
                callback(false);
            }
        }
    });
};
var getUUIDByAddress=function (address, callback) {
    connection.query('select * from users where emailaddress=?',address,function (err, result, field) {
        if (err) throw  err;
        if (result.length>0){
            callback(result[0].uuid);
        }
    })
};

var addOrderIntoUser=function (uuid,name, add, tel, recipname, recipadd, reciptel, callback) {
    connection.query('select * from users where uuid=?',uuid,function (err, result, field) {
        console.log(result);
        var currentcomments=result[0].orders;
        if (currentcomments==null){
            console.log('it is null');//new出一个新的json
            var jsonlist='{\"orderlist\":[';
            jsonlist+='{\"name\":\"'+name+
                '\",\"add\":\"'+add+
                '\",\"tel\":\"'+tel+
                '\",\"recipname\":\"'+recipname+
                '\",\"recipadd\":\"'+recipadd+
                '\",\"reciptel\":\"'+reciptel+'\"'+
                '}';
            jsonlist+=']}';
            var str=[jsonlist,uuid];
            console.log(jsonlist)
            connection.query('update users SET orders= ? WHERE uuid = ?',str);
        }else {
            //如果不为空则将旧的与新post的拼接起来。
            console.log('currentcomments:'+currentcomments);
            var newstrt=currentcomments.match(/\[.*\]/).toString();
            console.log('newstrt:'+newstrt);
            var finalstr=newstrt.match(/{.*}/);
            console.log('finalstr:'+finalstr);
            var toaddstr='{\"name\":\"'+name+
                '\",\"add\":\"'+add+
                '\",\"tel\":\"'+tel+
                '\",\"recipname\":\"'+recipname+
                '\",\"recipadd\":\"'+recipadd+
                '\",\"reciptel\":\"'+reciptel+'\"'+
                '}';;
            var finaljson='{"orderlist":['+finalstr+','+toaddstr+']}';
            console.log('json:'+finaljson);
            var result=[finaljson,uuid];
            connection.query('update users set orders=? where uuid =?',result);
        }
        callback(true);
    });
};

exports.insertToRegisterTable=function (address, num, callback) {
    queryFromDbToInsert(address,num,callback);
};
exports.checkNum=function (address, num, username,callback) {
    queryFromRegisterForNum(address,num,username,callback);
};
exports.insertToUsersTable=function (address, pwd,uuid,username) {
    insertToUsers(address,pwd,uuid,username);
};
exports.checkLoginResult=function (address, pwd, callback) {
    checkLogin(address,pwd,callback);
};
exports.getUUID=function (address, callback) {
    getUUIDByAddress(address,callback);
};
exports.addOrder=function (uuid,name, add, tel, recipname, recipadd, reciptel, callback) {
  addOrderIntoUser(uuid,name,add,tel,recipname,recipadd,reciptel,callback);
};




