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

module.exports.createTopic = async (req, res, next) => {
    var {
        title,
        content,
        category
    } = req.body;

    var result = methodSets.isNull(title, content, category)

    var isOver = title.length > 50 ? false : true

    if (!result && isOver) {
        return res.send({
            code: 400,
            msg: "value can not be empty",
            data: ""
        })
    }

    content = xss(content)

    var time = new Date().getTime()

    try {
        var sqlStr = "insert into topics (title, content, category, user_id, createdAt, updatedAt)     values (?,?,?,?,?,?)"
        var escapeArr = [methodSets.trim(title), content, category, req.userInfo.id, time, time]
        var result = await db.query({
            sqlStr,
            escapeArr
        });
        return res.send({
            code: 200,
            msg: "ok",
            data: ""
        })
    } catch (err) {
        return next(err)
    }
}

module.exports.getTopicList = async (req, res, next) => {
    var {
        category,
        queryWord
    } = req.body

    if (!methodSets.isNull(category, queryWord)) return res.send({
        code: 400,
        msg: "value can not be empty",
        data: ""
    })
    var sqlStr = ""
    if (queryWord === "new") {
        sqlStr = "select tc.id, tc.title, tc.category, tc.comments, tc.updatedAt, us.username from topics as tc inner join users as us on tc.user_id = us.id and us.deletedAt is null order by tc.createdAt desc limit ?"
    } else {
        "select tc.id, tc.title, tc.category, tc.comments, tc.updatedAt, us.username from topics as tc inner join users as us on tc.user_id = us.id and us.deletedAt is null order by tc.comments desc limit ?"
    }

    try {} catch (err) {}

}

module.exports.getTopicById = async (req, res, next) => {
    const {
        id
    } = req.params
    if (!id) return res.send({
        code: 400,
        msg: "value can not be empty",
        data: ""
    })
    var sqlStr = `select topics.*, users.username, users.avatar, GROUP_CONCAT(topics_like.user_id) as like_user_id, GROUP_CONCAT(topics_collection.user_id) as collection_user_id from topics 
    inner join users on topics.user_id = users.id 
    inner join topics_like on topics.id = topics_like.topic_id  
    inner join topics_collection on topics.id = topics_collection.topic_id
    where topics.id = ? and topics.deletedAt is null and users.deletedAt is null and topics_like.deletedAt is null limit 1`
    var escapeArr = [id]
    try {
        var result = await db.query({
            sqlStr,
            escapeArr
        })
        return res.send({
            code: 200,
            msg: "ok",
            data: result[0]
        })
    } catch (err) {
        return next(err)
    }



}

module.exports.getTopicsByDefault = async (req, res, next) => {
    try {
        var sqlStr = "SELECT topics.id, topics.title, topics.category, topics.updatedAt, users.username, users.avatar, COUNT(comments.id) as comment_count  FROM topics INNER JOIN users ON topics.user_id = users.id LEFT JOIN comments ON topics.id = comments.topic_id WHERE topics.deletedAt is NULL AND users.deletedAt is NULL AND comments.deletedAt is NULL GROUP BY topics.id ORDER BY topics.createdAt DESC LIMIT ?"
        var escapeArr = [20]
        var result = await db.query({
            sqlStr,
            escapeArr
        });
        return res.send({
            code: 200,
            msg: "ok",
            data: result
        })
    } catch (err) {
        next(err)
    }
}