var db = require('../models')

var methodSets = {
    trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    },
    // 参数是否为空
    isNull(...values) {
        for (val of values) {
            if (!val) return false;
        }
        return true;
    }
}

module.exports.getUserInfoByUserId = async (req, res, next) => {

    var {
        user_id
    } = req.params

    if (!user_id) return res.send({
        code: 400,
        msg: 'erro',
        data: ""
    })

    try {
        var result = await db.query({
            sqlStr: "select avatar, username, nickname, motto, email, github_email from users where deletedAt is null and id = ? limit 1",
            escapeArr: [user_id]
        })
        if (result.length > 0) {
            return res.send({
                code: 200,
                msg: "ok",
                data: result[0]
            })
        }

    } catch (err) {
        return next(err)
    }
}