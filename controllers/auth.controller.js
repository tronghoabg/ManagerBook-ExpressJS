var db = require('../db');
var md5 = require('md5')
var bcrypt = require('bcrypt');

module.exports.login = function(req, res) {
    res.render('auth/login');
}

module.exports.postLogin = function(req, res) {
    var userId = req.body.userId;
    var password = req.body.password;  
    var user = db.get('users').find({userId: userId}).value();

    var saltRounds = 10;    
    if(user){
        var countWrong = db.get('wrongLoginCount').find({userId: userId}).value().count
        if(countWrong >= 6) {
            res.render('auth/login', {
                error: ['bạn đã nhập sai mật khẩu! ' + countWrong + ' lần !!!'],
                values: req.body
            })
        }
        var check = bcrypt.compareSync(password, user.password)
    }

    if(!user){
        res.render('auth/login', {
            error: ['user dose not exits!'],
            values: req.body
        })
    }

    if(!check){
        var userBody = {
            userId: req.body.userId,
            count: 1
        };
        var user = db.get('wrongLoginCount').find({userId: userBody.userId}).value();
        if (!user) {
            db.get('wrongLoginCount').push(userBody).write();
        }else{
            db.get('wrongLoginCount').find({userId: userBody.userId})
            .assign( {
                count: user.count + 1
            }).write()
        }
        res.render('auth/login', {
            error: ['Wrong password!'],
            values: req.body
        })
    } 
    res.cookie('id', user.id)
    res.redirect('/users')
}
