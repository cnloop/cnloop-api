var db = require('../models')


module.exports.getNotices = async (req, res, next) => {
    try {
        var result = await db.query({
            sqlStr: "select * FROM ((select * from notices_like_comment where deletedAt is null and receiver_user_id = ?) union all (select * from notices_like_comment_son where deletedAt is null and receiver_user_id = ?) union all (select * from notices_like_topic where deletedAt is null and receiver_user_id = ?) union all (select * from notices_comment_topic where deletedAt is null and receiver_user_id = ?) union all (select * from notices_comment_parent_comment where deletedAt is null and receiver_user_id = ?) union all (select * from notices_collection_topic where deletedAt is null and receiver_user_id = ?)) as r ORDER BY r.createdAt desc",
            escapeArr: [req.userInfo.id, req.userInfo.id, req.userInfo.id, req.userInfo.id, req.userInfo.id, req.userInfo.id]
        })
        return res.send({
            code: 200,
            msg: "",
            data: result
        })
    } catch (err) {
        return next(err)
    }
}

module.exports.getNoticeCount = async (req, res, next) => {
    try {
        var result = await db.query({
            sqlStr: "select count(*) as count FROM ((select * from notices_like_comment where deletedAt is null and receiver_user_id = ?) union all (select * from notices_like_comment_son where deletedAt is null and receiver_user_id = ?) union all (select * from notices_like_topic where deletedAt is null and receiver_user_id = ?) union all (select * from notices_comment_topic where deletedAt is null and receiver_user_id = ?) union all (select * from notices_comment_parent_comment where deletedAt is null and receiver_user_id = ?) union all (select * from notices_collection_topic where deletedAt is null and receiver_user_id = ?)) as r where r.isRead = 0",
            escapeArr: [req.userInfo.id, req.userInfo.id, req.userInfo.id, req.userInfo.id, req.userInfo.id, req.userInfo.id]
        })
        return res.send({
            code: 200,
            msg: "ok",
            data: result[0].count
        })
    } catch (err) {
        return next(err)
    }
}

module.exports.updateIsReadStatus = async (req, res, next) => {
    try {
        var result = await db.query({
            sqlStr: "update notices_like_topic set isRead = 1 where deletedAt is null and receiver_user_id = ?",
            escapeArr: [req.userInfo.id, req.userInfo.id, req.userInfo.id, req.userInfo.id, req.userInfo.id, req.userInfo.id]
        })
        await db.query({
            sqlStr: "update notices_like_comment_son set isRead = 1 where deletedAt is null and receiver_user_id = ?",
            escapeArr: [req.userInfo.id]
        })

        await db.query({
            sqlStr: "update notices_like_comment set isRead = 1 where deletedAt is null and receiver_user_id = ?",
            escapeArr: [req.userInfo.id]
        })
        await db.query({
            sqlStr: "update notices_comment_topic set isRead = 1 where deletedAt is null and receiver_user_id = ?",
            escapeArr: [req.userInfo.id]
        })
        await db.query({
            sqlStr: "update notices_comment_parent_comment set isRead = 1 where deletedAt is null and receiver_user_id = ?",
            escapeArr: [req.userInfo.id]
        })
        await db.query({
            sqlStr: " update notices_collection_topic set isRead = 1 where deletedAt is null and receiver_user_id = ?",
            escapeArr: [req.userInfo.id]
        })
        return res.send({
            code: 200,
            msg: "ok",
            data: ""
        })
    } catch (err) {
        console.log(err)
        return next(err)
    }
}