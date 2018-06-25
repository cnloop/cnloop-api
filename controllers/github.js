var db = require('../models')
var config = require('../config')
var axios = require('axios')
var jwt = require("jsonwebtoken");
var md5 = require("blueimp-md5");

// 获取用户github信息

// 数据库查询是否已经存在此用户名

// 存在，

/// 不存在，向数据库插入一条新的用户信息

module.exports.verify = async (req, res, next) => {
    if (!req.query) return res.redirect('http://127.0.0.1:8080')
    try {
        var getCode = await axios({
            method: "post",
            url: "https://github.com/login/oauth/access_token",
            headers: {
                accept: "application/json"
            },
            data: {
                client_id: config.github.client_id,
                client_secret: config.github.client_secret,
                code: req.query.code
            }
        })
        if (!getCode.data.access_token) return res.redirect('http://127.0.0.1:8080')
        var getUserInfo = await axios.get('https://api.github.com/user', {
            params: {
                access_token: getCode.data.access_token
            }
        })

        if (!getUserInfo.data) return res.redirect('http://127.0.0.1:8080/404')
        console.log(getUserInfo.data);
        var id;
        var username = getUserInfo.data.login;
        var password = md5(new Date().getTime());
        var avatar = getUserInfo.data.avatar_url;
        var email = getUserInfo.data.email;
        var sqlStr = `select * from users where username = '${username}' limit 1`;
        try {
            var result = await db.query(sqlStr);
            console.log(result)
            if (!result.length) {
                var insertStr = `insert into users (username, github_name, password, avatar, email, createdAt) values ('${username}','${username}','${password}','${avatar}','${email}','${new Date().getTime()}')`;
                var insertResult = await db.query(insertStr);
                id = insertResult.insertId;
            }
            jwt.sign({
                id: id,
                username: username,
                password: password
            }, "cnloop", {
                expiresIn: '180d'
            }, function (
                err,
                token
            ) {
                if (!err) {
                    if (!result.length) {
                        var data = {
                            token: token,
                            user: {
                                id: id,
                                username: username,
                                avatar: avatar,
                                email: email
                            }
                        }
                    } else {
                        var data = {
                            token: token,
                            user: result[0]
                        }
                    }

                    return res.redirect(`http://127.0.0.1:8080/login?data=${JSON.stringify(data)}`)
                }
                return next(err)
            });
        } catch (err) {
            return next(err)
        }
    } catch (err) {
        console.log(err)
        return res.redirect('http://127.0.0.1:8080/404')
    }
}