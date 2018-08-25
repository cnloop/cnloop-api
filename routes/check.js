module.exports.isLogin = (req, res, next) => {
    if (req.userInfo) {
        return next()
    } else {
        return res.send({
            code: 403,
            msg: "you must have a status with loading..",
            data: ''
        })
    }
}