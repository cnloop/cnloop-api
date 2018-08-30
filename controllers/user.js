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
        } else {
            return res.send({
                code: 400,
                msg: "query userinfo result is null by userId",
                data: result[0]
            })
        }

    } catch (err) {
        return next(err)
    }
}


module.exports.getAllCountById = async (req, res, next) => {
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
            sqlStr: "SELECT  (SELECT COUNT(*) FROM topics WHERE deletedAt is NULL AND user_id = ?) as topicsCount, IFNULL((SELECT COUNT(*) FROM comments WHERE deletedAt is NULL AND user_id = ?),0)+IFNULL((SELECT COUNT(*) FROM comments_son WHERE deletedAt is NULL AND user_id = ?),0) as commentsCount, (SELECT COUNT(*) FROM topics_collection WHERE deletedAt is NULL AND user_id = ?) as topics_collectionCount, (SELECT COUNT(*) FROM users_follow WHERE deletedAt is NULL AND following_user_id = ?) as fansCount, (SELECT COUNT(*) FROM users_follow WHERE deletedAt is NULL AND  user_id = ?) as followingCount",
            escapeArr: [user_id, user_id, user_id, user_id, user_id, user_id]
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