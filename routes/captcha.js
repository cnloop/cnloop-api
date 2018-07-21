var express = require('express')
var jwt = require("jsonwebtoken");
var svgCaptcha = require('svg-captcha');
var router = express.Router()

router.get('/', (req, res, next) => {
    var captcha = svgCaptcha.createMathExpr({
        width: 80,
        height: 36,
        fontSize: 40,
        color: true,
    });
    try {
        jwt.sign({
            captcha_text: captcha.text
        }, "cnloop", {
            expiresIn: 1000 * 60 * 10
        }, function (
            err,
            token
        ) {
            if (!err) {
                return res.send({
                    code: 200,
                    msg: 'ok',
                    data: {
                        captcha_token: token,
                        captcha_svg: captcha.data
                    }
                })
            }
            next(err)
        });

    } catch (err) {
        return next(err);
    }
})

module.exports = router