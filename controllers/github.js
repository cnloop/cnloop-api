var db = require('../models')
var config = require('../config')
var axios = require('axios')
var jwt = require("jsonwebtoken");
var md5 = require("blueimp-md5");

// 获取用户github信息

// 数据库查询是否已经存在此用户名

// 存在，

/// 不存在，向数据库插入一条新的用户信息


var methodSets = {
    signUser(userInfo) {
        var deadline = {
            expiresIn: '180d'
        };
        return new Promise((res, rej) => {
            jwt.sign(userInfo, "cnloop", deadline, (err, token) => {
                if (err) {
                    rej(err)
                } else {
                    res(token)
                }
            });
        })
    }
}


module.exports.verify = async (req, res, next) => {
    if (!req.query) return res.redirect('https://cnloop.link')
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
        if (!getCode.data.access_token) return res.redirect('https://cnloop.link')
        var getUserInfo = await axios.get('https://api.github.com/user', {
            params: {
                access_token: getCode.data.access_token
            }
        })

        if (!getUserInfo.data) return res.redirect('https://cnloop.link/github');

        var userInfo = {
            username: getUserInfo.data.login,
            avatar: getUserInfo.data.avatar_url,
            github_email: getUserInfo.data.email
        }

        var result = await db.query({
            sqlStr: 'select * from users where github_email = ? limit 1',
            escapeArr: [userInfo.github_email]
        });
        if (result.length) {

            var token = await methodSets.signUser(Object.assign({}, result[0]))

            var github_data = {
                user: result[0],
                token: token
            }

            return res.redirect(`https://cnloop.link/github?data=${JSON.stringify(github_data)}`)

        } else {

            var time = new Date().getTime();

            var insert_result = await db.query({
                sqlStr: 'insert into users (username, avatar, github_email, createdAt, last_login) values (?,?,?,?,?)',
                escapeArr: [userInfo.username, userInfo.avatar, userInfo.github_email, time, time]
            })


            userInfo.id = insert_result.insertId;

            userInfo.createdAt = time;

            userInfo.last_login = time;


            var token = await methodSets.signUser(userInfo)

            var github_data = {
                user: userInfo,
                token: token
            }

            return res.redirect(`https://cnloop.link/github?data=${JSON.stringify(github_data)}`)
        }

    } catch (err) {
        return res.redirect('https://cnloop.link/github')
    }
}