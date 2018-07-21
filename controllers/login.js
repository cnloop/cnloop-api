var db = require('../models')
var jwt = require("jsonwebtoken");
var md5 = require("blueimp-md5");



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
}

module.exports.createToken = async (req, res, next) => {
    var {
        email,
        password
    } = req.body;
    console.dir(req.body)
    try {
        var sqlStr = `select * from users where email = ? and password = ? limit 1`;
        var escapeArr = [email, md5(password)]
        var result = await db.query({
            sqlStr,
            escapeArr
        });
        if (!result.length) {
            return res.send({
                code: 400,
                msg: '账号或密码错误...',
                data: {}
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
        next(err)
    }

}