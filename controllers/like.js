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

module.exports.getLikeListByLoad = async (req, res, next) => {

    try {
        var result = await db.query({
            sqlStr: "select * from ((select t.createdAt, t.topic_id, r.title as topic_content, '%empty%' as comment_id, '%empty%' as comment_content, '%empty%' as comment_son_id, '%empty%' as comment_son_id_content, r.user_id, r.avatar, r.username, '%empty%' as targetId from (select * from topics_like where deletedAt is null and user_id = ?) as t inner join (select new_topics.*, new_users.avatar, new_users.username from (select * from topics where deletedAt is null) as new_topics inner join (select * from users where deletedAt is null)as new_users on new_users.id = new_topics.user_id) as r on r.id = t.topic_id) union all (select cl.createdAt, '%empty%' as topic_id, '%empty%' as topic_content, cl.comment_id, r.content as comment_content, '%empty%' as comment_son_id, '%empty%' as comment_son_id_content, r.user_id, r.avatar, r.username, r.topic_id as targetId from (select * from comments_like where deletedAt is null and user_id = ?) as cl inner join (select c.*, new_users.avatar, new_users.username from (select * from comments where deletedAt is null) as c inner join (select * from users where deletedAt is null) as new_users on new_users.id = c.user_id) as r on r.id = cl.comment_id) union all (select csl.createdAt, '%empty%' as topic_id, '%empty%' as topic_content, '%empty%' as comment_id, '%empty%' as comment_content, r.parent_comment_id as comment_son_id, r.content as comment_son_id_content, r.user_id, r.avatar, r.username, r.topic_id as targetId from (select * from comments_son_like where deletedAt is null and user_id = ?) as csl inner join (select cs.*, c.topic_id, new_users.avatar, new_users.username from (select * from comments_son where deletedAt is null) as cs inner join (select * from users where deletedAt is null) as new_users on new_users.id = cs.user_id inner join (select * from comments where deletedAt is null) as c on c.id = cs.parent_comment_id) as r on r.id = csl.comment_son_id)) as r_u ORDER BY r_u.createdAt desc",
            escapeArr: [req.userInfo.id, req.userInfo.id, req.userInfo.id]
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
        next(err)
    }
}