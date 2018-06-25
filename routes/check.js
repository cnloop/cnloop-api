module.exports.isLogin = (req, res, next) => {
    if (req.isVerified) {
        return next()
    } else {
        return res.send({
            code: 400,
            msg: '未登录',
            data: ''
        })
    }
}