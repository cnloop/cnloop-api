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

module.exports.changeFollowingStatus = async (req, res, next) => {

    var {
        following_user_id
    } = req.body

    if (!following_user_id) return res.send({
        code: 400,
        msg: "following_user_id is null",
        data: ""
    })

    if (following_user_id == req.userInfo.id) return res.send({
        code: 400,
        msg: "you can not allow to follow youself...",
        data: ""
    })

    var time = new Date().getTime()

    try {
        var searchResult = await db.query({
            sqlStr: "select * from users_follow where deletedAt is null and user_id = ? and following_user_id = ? limit 1",
            escapeArr: [req.userInfo.id, following_user_id]
        })
        if (searchResult.length > 0) {
            var updateResult = await db.query({
                sqlStr: "update users_follow set deletedAt = ? where user_id = ? and following_user_id = ? and deletedAt is null limit 1",
                escapeArr: [time, req.userInfo.id, following_user_id]
            })
            if (updateResult.affectedRows > 0) {
                return res.send({
                    code: 200,
                    msg: 'ok',
                    data: ''
                })
            } else {
                return res.send({
                    code: 400,
                    msg: 'err',
                    data: ''
                })
            }
        } else {
            var insertResult = await db.query({
                sqlStr: "insert into users_follow (user_id, following_user_id, createdAt) values (?,?,?)",
                escapeArr: [req.userInfo.id, following_user_id, time]
            })
            return res.send({
                code: 200,
                msg: "ok",
                data: ""
            })
        }
    } catch (err) {
        return next(err)
    }

    try {

    } catch (err) {
        return next(err)
    }
}

module.exports.getFollowingList = async (req, res, next) => {
    if (!req.userInfo) return res.send({
        code: 400,
        msg: "you must have a status with loading...",
        data: ""
    })
    try {
        var result = await db.query({
            sqlStr: "select * from users_follow where deletedAt is null and user_id = ?",
            escapeArr: [req.userInfo.id]
        })
        if (result.length > 0) {
            return res.send({
                code: 200,
                msg: "ok",
                data: result
            })
        } else {
            return res.send({
                code: 400,
                msg: "you are not follow anyone",
                data: ""
            })
        }
    } catch (err) {
        return next(err)
    }
}

module.exports.getTargetFollowersList = async (req, res, next) => {
    var {
        following_user_id
    } = req.params


    if (!following_user_id) return res.send({
        code: 400,
        msg: "following_user_id is null",
        data: ""
    })
    try {
        var result = await db.query({
            sqlStr: "select users_follow.*, new_users.avatar, new_users.username, new_users.nickname from users_follow inner join (select * from users where deletedAt is null) as new_users on new_users.id = users_follow.user_id where users_follow.deletedAt is null and users_follow.following_user_id = ?",
            escapeArr: [following_user_id]
        })
   
        if (result.length > 0) {
            return res.send({
                code: 200,
                msg: "ok",
                data: result
            })
        } else {
            return res.send({
                code: 400,
                msg: "query result is null",
                data: ""
            })
        }
    } catch (err) {
        return next(err)
    }
}