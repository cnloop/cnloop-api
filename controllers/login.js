var db = require('../models')
var jwt = require("jsonwebtoken");
var md5 = require("blueimp-md5");
var moment = require('moment');




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

    },
    convertYMD(oneDate) {
        var y = new Date(oneDate).getFullYear();
        var m = new Date(oneDate).getMonth() + 1;
        var d = new Date(oneDate).getDate();
    }
}

module.exports.createToken = async (req, res, next) => {
    var {
        email,
        password
    } = req.body;
    try {
        var sqlStr = `select * from users where email = ? and password = ? and deletedAt is null limit 1`;
        var escapeArr = [email, md5(password)]
        var result = await db.query({
            sqlStr,
            escapeArr
        });
        if (!result.length) {
            return res.send({
                code: 400,
                msg: '账号或密码错误...',
                data: ""
            })
        }
        result[0].password = '';
        var token = await methodSets.signUser(Object.assign({}, result[0]))
        return res.send({
            code: 200,
            msg: 'ok',
            data: {
                user: result[0],
                token: token
            }
        })
    } catch (err) {
        return next(err)
    }

}

module.exports.markLoginStatus = async (req, res, next) => {
    var time = new Date().getTime()
    try {
        var sqlStr = "select * from users_status where FROM_UNIXTIME(SUBSTRING(createdAt,1,10),'%Y%m%d') = ?  and deletedAt is null and user_id = ? order by createdAt desc limit 1"
        var escapeArr = [moment(time).format('YYYYMMDD'), req.userInfo.id]
        var result = await db.query({
            sqlStr,
            escapeArr
        });
        if (!result.length) {
            var inser_result = await db.query({
                sqlStr: "insert into users_status (user_id, createdAt) values (?,?)",
                escapeArr: [req.userInfo.id, time]
            });
            return res.send(inser_result)
        } else {
            var update_result = await db.query({
                sqlStr: "update users_status set updatedAt = ?  where id = ?",
                escapeArr: [time, result[0].id]
            });
            return res.send(update_result)
        }
    } catch (err) {
        return next(err)
    }
}