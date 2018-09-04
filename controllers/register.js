var db = require('../models')
var jwt = require("jsonwebtoken");
var md5 = require("blueimp-md5");
var nodemailer = require('nodemailer');
var template = require('art-template');
var path = require('path')




var regExp = {
    trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    },
    emailReg() {
        return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
    },
    passwordReg() {
        return /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
    },
}

var methodSets = {
    // 参数是否为空
    isNull(...values) {
        for (val of values) {
            if (!val) return false;
        }
        return true;
    },
    // jwt验证之前签发的验证码与客户本次上传是否一致
    jwt_verify(captcha, captcha_token) {
        return new Promise((res, rej) => {
            jwt.verify(captcha_token, "cnloop", function (err, decoded) {
                if (err) {
                    rej(err)
                } else {
                    res(decoded.captcha_text === captcha)
                }
            });
        })
    },
    // 随机生成26个英文字母大写
    randomCharacter() {
        var codePoint = Math.round(Math.random() * 25 + 65);
        return String.fromCodePoint(codePoint);
    },
    // 为新注册用户签发token
    signToken(email, password) {
        var userInfo = {
            email,
            password
        };
        var deadline = {
            expiresIn: '1d'
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
    sendEmail(email, url) {
        return new Promise((res, rej) => {
            let transporter = nodemailer.createTransport({
                // host: 'smtp.ethereal.email',
                service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
                // host: 'smtp.163.com',
                port: 465, // SMTP 端口
                secureConnection: true, // 使用了 SSL
                // secure: true,
                auth: {
                    user: 'cn-loop@qq.com',
                    // user: 'qiuxue0714@163.com',
                    // 这里密码不是qq密码，是你设置的smtp授权码
                    pass: 'ajmdxczajpqpbeeg',
                    // pass:'wuqiuxue119'
                    // pass: 'wuqiuxue119'
                }
            });

            var html = template(path.join(process.cwd(), './template/register_email.html'), {
                url
            })
            let mailOptions = {
                from: '"CNLOOP" <cn-loop@qq.com>', // sender address
                // from: '"CNLOOP" <qiuxue0714@163.com>',
                to: email, // list of receivers
                subject: 'complete the registration', // Subject line
                // text:'123'
                // html: `Please complete the registration ——> <a href="${url}">Go</a>`

                html: html // html body

            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    rej(error)
                }
                res(info)
            });
        });

    },
    jwt_email(token) {
        return new Promise((res, rej) => {
            jwt.verify(token, "cnloop", function (err, decoded) {
                if (err) {
                    rej(err)
                } else {
                    res(decoded)
                }
            });
        })
    },
    signUser(id, email, username) {
        var userInfo = {
            id,
            email,
            username
        };
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

module.exports.createUser = async (req, res, next) => {
    var {
        email,
        password,
        captcha,
        captcha_token
    } = req.body;

    if (!methodSets.isNull(email, password, captcha, captcha_token)) return res.send({
        code: 400,
        msg: '请填写完整',
        data: {}
    });

    if (!regExp.emailReg().test(regExp.trim(email))) return res.send({
        code: 400,
        msg: '邮件格式不正确',
        data: {}
    });

    if (!regExp.passwordReg().test(regExp.trim(password))) return res.send({
        code: 400,
        msg: '密码必须为字母加数字且长度8-16位',
        data: {}
    });

    try {
        var isEqual = await methodSets.jwt_verify(captcha, captcha_token);
        if (!isEqual) {
            return res.send({
                code: 400,
                msg: '验证码不正确',
                data: {}
            });
        }

        var affectRows = await db.query({
            sqlStr: 'select email from users where email = ?',
            escapeArr: [regExp.trim(email)]
        })
        if (affectRows.length > 0) {
            return res.send({
                code: 400,
                msg: '邮箱已经注册',
                data: {}
            });
        }


        var token = await methodSets.signToken(regExp.trim(email), regExp.trim(password));

        var url_token = `https://cnloop.link/verify?register_token=${token}`

        // var url_token = `http://127.0.0.1:8080/verify?register_token=${token}`



        var info = await methodSets.sendEmail(regExp.trim(email), url_token);

        if (!info.messageId) {
            return res.send({
                code: 400,
                msg: '邮箱是否可用',
                data: {}
            })
        }

        return res.send({
            code: 200,
            msg: 'ok',
            data: {}
        })
    } catch (err) {
        console.log(err)
        return next(err);
    }
}

module.exports.insertUser = async (req, res, next) => {
    var {
        register_token
    } = req.body;
    try {
        var userinfo = await methodSets.jwt_email(register_token);

        var userArr = await db.query({
            sqlStr: 'select * from users where email = ? and deletedAt is null limit 1',
            escapeArr: [userinfo.email]
        })

        if (userArr.length) {
            return res.send({
                code: 400,
                msg: '您已经注册过此邮箱',
                data: {}
            })
        }

        var time = new Date().getTime()


        var username = methodSets.randomCharacter() + time;



        var sqlStr = 'insert into users (username, password, email, createdAt, last_login) values (?,?,?,?,?)';

        var escapeArr = [username, md5(userinfo.password), userinfo.email, time, time];

        var result = await db.query({
            sqlStr,
            escapeArr
        });


        var sign_token = await methodSets.signUser(result.insertId, userinfo.email, username)

        return res.send({
            code: 200,
            msg: 'ok',
            data: {
                user: {
                    id: result.insertId,
                    email: userinfo.email,
                    username: username
                },
                token: sign_token
            }
        })
    } catch (err) {
        return next(err)
    }

}