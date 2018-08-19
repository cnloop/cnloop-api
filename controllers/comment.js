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
        console.dir(result)
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
        console.dir(result)
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

    var sqlStr = `SELECT comments.*, users.avatar, users.username, 
    GROUP_CONCAT(CONCAT(new_comments_son.avatar,',',new_comments_son.username,',',new_comments_son.id,',',new_comments_son.content,',',new_comments_son.user_id,',',new_comments_son.createdAt),'|') 
    as comment_son_info 
        FROM comments 
        INNER JOIN users on comments.user_id = users.id
        LEFT JOIN (SELECT comments_son.*, users.avatar, users.username FROM comments_son INNER JOIN users on comments_son.user_id = users.id) as new_comments_son
        on comments.id = new_comments_son.parent_comment_id 
        WHERE comments.topic_id = ?
        AND comments.deletedAt is null 
        AND users.deletedAt is NULL
        AND new_comments_son.deletedAt is null 
        GROUP BY comments.id`;
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