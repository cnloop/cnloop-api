var db = require('../models')
var xss = require('xss');

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

module.exports.createComment = async (req, res, next) => {
    var {
        content,
        topic_id
    } = req.body

    if (!methodSets.isNull(content, topic_id)) return res.send({
        code: 400,
        msg: "value can not be empty",
        data: ""
    })

    content = xss(content)

    var time = new Date().getTime()

    try {
        var sqlStr = "insert into comments (content, user_id, topic_id, createdAt)  values (?,?,?,?)"
        var escapeArr = [content, req.userInfo.id, topic_id, time]
        var result = await db.query({
            sqlStr,
            escapeArr
        });

        var result_Topic = await db.query({
            sqlStr: "select * from topics where deletedAt is null and id = ?",
            escapeArr: [topic_id]
        })
        var sender_user_id = req.userInfo.id
        var receiver_user_id = result_Topic[0].user_id
        if (receiver_user_id != req.userInfo.id) {
            await db.query({
                sqlStr: "insert into notices_comment_topic (sender_user_id, sender_avatar, sender_username, receiver_user_id, type, target_id, content, topic_id, isRead, createdAt) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                escapeArr: [sender_user_id, req.userInfo.avatar, req.userInfo.username, receiver_user_id, "comment_topic", result.insertId, content, topic_id, 0, time]
            })
        }

        return res.send({
            code: 200,
            msg: "ok",
            data: ""
        })
    } catch (err) {
        return next(err)
    }
}

module.exports.createCommentSon = async (req, res, next) => {
    var {
        content,
        parent_comment_id
    } = req.body

    if (!methodSets.isNull(content, parent_comment_id)) return res.send({
        code: 400,
        msg: "value can not be empty",
        data: ""
    })

    content = xss(content)

    var time = new Date().getTime()

    try {
        var sqlStr = "insert into comments_son (content, user_id, parent_comment_id, createdAt)  values (?,?,?,?)"
        var escapeArr = [content, req.userInfo.id, parent_comment_id, time]
        var result = await db.query({
            sqlStr,
            escapeArr
        });


        var result_comment = await db.query({
            sqlStr: "select * from comments where deletedAt is null and id = ?",
            escapeArr: [parent_comment_id]
        })

        var receiver_user_id = result_comment[0].user_id
        var sender_user_id = req.userInfo.id

        if (receiver_user_id != req.userInfo.id) {
            await db.query({
                sqlStr: "insert into notices_comment_parent_comment (sender_user_id, sender_avatar, sender_username, receiver_user_id, type, target_id, content, topic_id, isRead, createdAt) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                escapeArr: [sender_user_id, req.userInfo.avatar, req.userInfo.username, receiver_user_id, "comment_parent_comment", parent_comment_id, content.substring(0, 100), result_comment[0].topic_id, 0, time]
            })
        }

        return res.send({
            code: 200,
            msg: "ok",
            data: ""
        })
    } catch (err) {
        return next(err)
    }
}

module.exports.insertCommentLike = async (req, res, next) => {

    var {
        commentId
    } = req.params

    if (!commentId) return res.send({
        code: 400,
        msg: "value can not be empty",
        data: ""
    })

    var time = new Date().getTime()
    try {
        var result = await db.query({
            sqlStr: "select * from comments_like where user_id = ? and comment_id = ? and deletedAt is null",
            escapeArr: [req.userInfo.id, commentId]
        })
        if (!result.length > 0) {
            var sqlStr = "insert into comments_like (comment_id, user_id, createdAt) values (?,?,?)"
            var escapeArr = [commentId, req.userInfo.id, time]
            await db.query({
                sqlStr,
                escapeArr
            })

            var resultComment = await db.query({
                sqlStr: "select * from comments where deletedAt is null and id = ?",
                escapeArr: [commentId]
            })

            var receiver_user_id = resultComment[0].user_id

            var sender_user_id = req.userInfo.id

            if (receiver_user_id != sender_user_id) {
                await db.query({
                    sqlStr: "insert into notices_like_comment (sender_user_id, sender_avatar, sender_username, receiver_user_id, type, target_id, content, topic_id, isRead, createdAt) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    escapeArr: [sender_user_id, req.userInfo.avatar, req.userInfo.username, receiver_user_id, "like_comment", commentId, resultComment[0].content.substring(0, 100), resultComment[0].topic_id, 0, time]
                })
            }




        } else {
            await db.query({
                sqlStr: "update comments_like set deletedAt = ? where id = ? ",
                escapeArr: [time, result[0].id]
            })
        }
        return res.send({
            code: 200,
            msg: "ok",
            data: ""
        })
    } catch (err) {
        return next(err)
    }

}


module.exports.insertCommentSonLike = async (req, res, next) => {

    var {
        commentSonId
    } = req.params

    if (!commentSonId) return res.send({
        code: 400,
        msg: "value can not be empty",
        data: ""
    })

    var time = new Date().getTime()
    try {
        var result = await db.query({
            sqlStr: "select * from comments_son_like where user_id = ? and comment_son_id = ? and deletedAt is null",
            escapeArr: [req.userInfo.id, commentSonId]
        })
        if (!result.length > 0) {
            var sqlStr = "insert into comments_son_like (comment_son_id, user_id, createdAt) values (?,?,?)"
            var escapeArr = [commentSonId, req.userInfo.id, time]
            await db.query({
                sqlStr,
                escapeArr
            })

            var resultCommentSon = await db.query({
                sqlStr: "select comments_son.*, c.topic_id from comments_son inner join (select * from comments where deletedAt is null) as c on c.id = comments_son.parent_comment_id where comments_son.deletedAt is null and comments_son.id = ?",
                escapeArr: [commentSonId]
            })

            var receiver_user_id = resultCommentSon[0].user_id

            var sender_user_id = req.userInfo.id

            if (receiver_user_id != sender_user_id) {
                await db.query({
                    sqlStr: "insert into notices_like_comment_son (sender_user_id, sender_avatar, sender_username, receiver_user_id, type, target_id, content, topic_id, isRead, createdAt) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    escapeArr: [sender_user_id, req.userInfo.avatar, req.userInfo.username, receiver_user_id, "like_comment_son", resultCommentSon[0].parent_comment_id, resultCommentSon[0].content.substring(0, 100), resultCommentSon[0].topic_id, 0, time]
                })
            }

        } else {
            await db.query({
                sqlStr: "update comments_son_like set deletedAt = ? where id = ? ",
                escapeArr: [time, result[0].id]
            })
        }
        return res.send({
            code: 200,
            msg: "ok",
            data: ""
        })
    } catch (err) {
        return next(err)
    }

}

module.exports.getCommentList = async (req, res, next) => {
    var {
        topicId
    } = req.params


    if (!topicId) return res.send({
        code: 400,
        msg: "value can not be empty",
        data: ""
    })

    var sqlStr = `
    SELECT comments.*, new_users.avatar, new_users.username, new_comments_like.parent_comment_sets, result_comment_son.comment_son_info FROM comments

    INNER JOIN (SELECT * FROM users WHERE users.deletedAt is NULL) as new_users on new_users.id = comments.user_id

    LEFT JOIN (SELECT comments_like.comment_id, GROUP_CONCAT(comments_like.user_id) as parent_comment_sets FROM comments_like WHERE comments_like.deletedAt is NULL GROUP BY comments_like.comment_id) as new_comments_like on comments.id = new_comments_like.comment_id

    LEFT JOIN (
    SELECT comments_son.parent_comment_id, GROUP_CONCAT(CONCAT(IFNULL(new_users.avatar,'%empty%') , '&&', IFNULL(new_users.username,'%empty%'), '&&', IFNULL(comments_son.id,'%empty%'), '&&', IFNULL(comments_son.content,'%empty%'), '&&', IFNULL(comments_son.user_id,'%empty%'), '&&', IFNULL(comments_son.createdAt,'%empty%'), '&&', IFNULL(new_comments_son_like.son_like_sets,'%empty%')) SEPARATOR '|||') as comment_son_info FROM comments_son 

    INNER JOIN (SELECT * FROM users WHERE users.deletedAt is NULL) as new_users on new_users.id = comments_son.user_id


    LEFT JOIN (SELECT comments_son_like.comment_son_id, GROUP_CONCAT(comments_son_like.user_id) as son_like_sets FROM comments_son_like WHERE comments_son_like.deletedAt is null GROUP BY comments_son_like.comment_son_id) as new_comments_son_like on new_comments_son_like.comment_son_id = comments_son.id

    WHERE comments_son.deletedAt is NULL GROUP BY comments_son.parent_comment_id
    ) as result_comment_son on comments.id = result_comment_son.parent_comment_id



    WHERE comments.deletedAt is NULL AND  comments.topic_id = ? ORDER BY comments.createdAt
    `;
    var escapeArr = [topicId]
    try {
        var result = await db.query({
            sqlStr,
            escapeArr
        })
        return res.send({
            code: 200,
            msg: "ok",
            data: result
        })
    } catch (err) {
        return next(err)
    }
}

module.exports.getCommentByDefaultUserId = async (req, res, next) => {
    var sqlStr = `
    select  BigResult.* from
    ((select new_comments.id, left(new_comments.content, 100) as content, new_comments.createdAt, new_users.avatar, new_users.username, new_comments.topic_id, new_topics.title as targetContent, 'parent' as targetCategory from (select * from comments where deletedAt is null and user_id = ?) as new_comments inner join (select * from users where deletedAt is null) as new_users on new_users.id = new_comments.user_id
    inner join (select * from topics where deletedAt is null) as new_topics on new_topics.id = new_comments.topic_id) union all (select

    new_comments_son.parent_comment_id as id, left(new_comments_son.content,100) as content, new_comments_son.createdAt, new_users.avatar, new_users.username, new_comments.topic_id, left(new_comments.content,100) as targetContent, 'son' as  targetCategory

    from (select * from comments_son where deletedAt is null and user_id = ?) as new_comments_son

    inner join (select * from users where deletedAt is null) as new_users on new_users.id = new_comments_son.user_id

    inner join (select * from comments where deletedAt is null and user_id = ?) as new_comments on new_comments.id = new_comments_son.parent_comment_id)) as BigResult order by BigResult.createdAt desc 
    `

    try {
        var result = await db.query({
            sqlStr: sqlStr,
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
                msg: "err",
                data: ""
            })
        }

    } catch (err) {
        next(err)
    }
}

module.exports.getCommentByUserId = async (req, res, next) => {
    var {
        user_id
    } = req.params

    if (!user_id) {
        return res.send({
            code: 400,
            msg: "value can not be empty",
            data: ""
        })
    }
    var sqlStr = `
    (select new_comments.id, left(new_comments.content, 100) as content, new_comments.createdAt, new_users.avatar, new_users.username, new_comments.topic_id, new_topics.title as targetContent, 'parent' as targetCategory from (select * from comments where deletedAt is null and user_id = ?) as new_comments inner join (select * from users where deletedAt is null) as new_users on new_users.id = new_comments.user_id
    inner join (select * from topics where deletedAt is null) as new_topics on new_topics.id = new_comments.topic_id) union all (select

    new_comments_son.parent_comment_id as id, left(new_comments_son.content,100) as content, new_comments_son.createdAt, new_users.avatar, new_users.username, new_comments.topic_id, left(new_comments.content,100) as targetContent, 'son' as  targetCategory

    from (select * from comments_son where deletedAt is null and user_id = ?) as new_comments_son

    inner join (select * from users where deletedAt is null) as new_users on new_users.id = new_comments_son.user_id

    inner join (select * from comments where deletedAt is null and user_id = ?) as new_comments on new_comments.id = new_comments_son.parent_comment_id)
    `

    try {
        var result = await db.query({
            sqlStr: sqlStr,
            escapeArr: [user_id, user_id, user_id]
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
                msg: "err",
                data: ""
            })
        }

    } catch (err) {
        next(err)
    }
}