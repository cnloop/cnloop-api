var db = require('../models')
var jwt = require("jsonwebtoken");
var md5 = require("blueimp-md5");

module.exports.createUser = async (req, res, next) => {
    var {
        username,
        password
    } = req.body;

    var sqlStr = `insert into users (username, password, createdAt) values ('${username}','${md5(password)}','${new Date().getTime()}')`;

    try {
        var result = await db.query(sqlStr);
        jwt.sign({
            id: result.insertId,
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
                        user: {
                            id: result.insertId,
                            username: username
                        }
                    }
                })
            }
            next(err)
        });

    } catch (err) {
        return next(err);
    }
}

