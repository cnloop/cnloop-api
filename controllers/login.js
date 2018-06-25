var db = require('../models')
var jwt = require("jsonwebtoken");
var md5 = require("blueimp-md5");

module.exports.createToken = async (req, res, next) => {
    var {
        username,
        password
    } = req.body;
    console.log(req.query)
    try {
        var sqlStr = `select * from users where username = '${username}' and password = '${md5(password)}'  limit 1`;
        var result = await db.query(sqlStr);
        console.log(result)
        if (result.length) {
            jwt.sign({
                id: result[0].id,
                username: username,
                password: password
            }, "cnloop", {
                expiresIn: '180d'
            }, function (
                err,
                token
            ) {
                if (!err) {
                    return res.send({
                        code: 200,
                        msg: 'ok',
                        data: {
                            token: token,
                            user: result[0]
                        }
                    })
                }
                next(err)
            });
        } else {
            return res.send({
                code: 400,
                msg: 'err'
            })
        }


    } catch (err) {
        next(err)
    }

}