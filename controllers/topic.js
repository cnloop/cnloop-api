var db = require('../models')
var xss = require('xss');
var path = require("path")
var fs = require("fs")
var formidable = require("formidable")
var qiniu = require('node-qiniu')
var config = require("../config")
qiniu.config({
    access_key: config.qiniu.access_key,
    secret_key: config.qiniu.secret_key
})

var imagesBucket = qiniu.bucket(config.qiniu.bucket);

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
    title = xss(title)
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

function getFile(req) {
    return new Promise((res, rej) => {
        var form = new formidable.IncomingForm();
        form.uploadDir = path.join(process.cwd(), "uploads")
        form.maxFileSize = 2 * 1024 * 1024;
        form.parse(req, function (err, fields, files) {
            if (err) {
                return rej(err)
            }
            res({
                fields,
                files
            })
        })
    })
}

function fileReName(filePath, newPath) {
    return new Promise((res, rej) => {
        fs.rename(filePath, newPath, function (err) {
            if (err) return rej(err)
            res()
        })
    })
}

function uploadQiNiu(fileName, newPath) {
    new Promise((res, rej) => {
        imagesBucket.putFile(fileName, newPath, function (err, reply) {
            if (err) return rej(err)
            res(reply)
        })
    })
}

module.exports.uploadImage = async (req, res, next) => {
    try {
        var resultGetFile = await getFile(req)
        if (!resultGetFile.files.image.path) {
            return res.send({
                code: 400,
                msg: "server not get images...",
                data: ""
            })
        }
        var fileName = `${new Date().getTime()}.png`
        var newPath = path.join(process.cwd(), 'uploads', fileName)
        var resultFileReName = await fileReName(resultGetFile.files.image.path, newPath)
        var resultUploadQiNiu = await uploadQiNiu(fileName, newPath)
        fs.unlinkSync(newPath)
        return res.send({
            code: 200,
            msg: "ok",
            data: `${config.qiniu.domain}/${fileName}`
        })
    } catch (err) {
        return next(err)
    }

}

module.exports.getTopicList = async (req, res, next) => {
    var {
        category,
        newOrhot,
    } = req.query

    if (!methodSets.isNull(category, newOrhot)) return res.send({
        code: 400,
        msg: "value can not be empty",
        data: ""
    })

    if (category.indexOf('general') >= 0) {
        category = "General Discussion"
    } else if (category.indexOf("help") >= 0) {
        category = "Get Help"
    } else if (category.indexOf("vue") >= 0) {
        category = "Show & Vue.js"
    } else if (category.indexOf("css") >= 0) {
        category = "Show & CSS"
    } else if (category.indexOf("js") >= 0) {
        category = "Show & JS"
    } else {
        category = "Show & Node.js"
    }

    if (newOrhot == "new") {
        newOrhot = "result_time"
    } else {
        newOrhot = "result_count"
    }

    var {
        pageIndex
    } = req.query

    if (pageIndex < 1 || !pageIndex) pageIndex = 1

    // 规定每页显示 20 条

    var limit = 20;

    var start = (pageIndex - 1) * limit


    var sqlStr = `
    -- 最后回复日期或者发布日期，回复的总条数，回复者user_info信息
    select topics.id, topics.title, topics.category, topics.user_id, topics.browsed, topics.createdAt, new_users.avatar, new_users.username, GREATEST(topics.createdAt, ifnull(result_comments.result_time,0)) as result_time, result_comments.result_count, concat(concat(ifnull(new_users.avatar,'%empty%'),'&&', new_users.username),'|||',ifnull(result_comments.result_user_info,'%empty%&&%empty%')) as result_user_info  from topics

    inner join (
        -- users 表
        select * from users where users.deletedAt is null
    ) as new_users on new_users.id = topics.user_id

    left join (
    -- sum(count(*)+ifnull(result_comments_son.s_count,0))
    -- 1
    select new_comments.topic_id, max(GREATEST(new_comments.createdAt,ifnull(result_comments_son.s_time,0))) as result_time, group_concat(concat(new_comments.c_user_info,'|||',ifnull(result_comments_son.s_r_user_info,'%empty%&&%empty%')) SEPARATOR '|||') as result_user_info, count(*)+ifnull(sum(result_comments_son.s_count),0) as result_count from 
    -- comments.* | c_user_info
    -- start
    (select comments.*, concat(ifnull(c_users.avatar,'%empty%'),'&&',c_users.username) as c_user_info  from comments inner join (select * from users where users.deletedAt is null) as c_users on c_users.id = comments.user_id  where comments.deletedAt is null) as new_comments
    -- end

    -- 2
    left join

    -- parent_comment_id | s_count | s_time | s_r_user_info
    -- start
    (select new_comments_son.parent_comment_id, count(*) as s_count, max(new_comments_son.createdAt) as s_time, group_concat(new_comments_son.s_user_info SEPARATOR '|||') as s_r_user_info  from

    (select comments_son.*, concat(ifnull(s_users.avatar,'%empty%'),'%%',s_users.username) as s_user_info from comments_son inner join (select * from users where users.deletedAt is null) as s_users on s_users.id = comments_son.user_id  where comments_son.deletedAt is null) as 
    
    new_comments_son group by new_comments_son.parent_comment_id) as result_comments_son
    -- end

    -- 3
    on result_comments_son.parent_comment_id = new_comments.id  group by new_comments.topic_id


    ) as result_comments on result_comments.topic_id = topics.id

    where topics.deletedAt is null and topics.category = '${category}' ORDER BY ${newOrhot} DESC LIMIT ${start}, ${limit}
    `;

    var sqlCount = `
        -- 最后回复日期或者发布日期，回复的总条数，回复者user_info信息
        select count(*) as pageCount  from topics

        inner join (
            -- users 表
            select * from users where users.deletedAt is null
        ) as new_users on new_users.id = topics.user_id

        left join (
        -- sum(count(*)+ifnull(result_comments_son.s_count,0))
        -- 1
        select new_comments.topic_id, max(GREATEST(new_comments.createdAt,ifnull(result_comments_son.s_time,0))) as result_time, group_concat(concat(new_comments.c_user_info,'|||',ifnull(result_comments_son.s_r_user_info,'%empty%&&%empty%')) SEPARATOR '|||') as result_user_info, count(*)+ifnull(sum(result_comments_son.s_count),0) as result_count from 
        -- comments.* | c_user_info
        -- start
        (select comments.*, concat(ifnull(c_users.avatar,'%empty%'),'&&',c_users.username) as c_user_info  from comments inner join (select * from users where users.deletedAt is null) as c_users on c_users.id = comments.user_id  where comments.deletedAt is null) as new_comments
        -- end

        -- 2
        left join

        -- parent_comment_id | s_count | s_time | s_r_user_info
        -- start
        (select new_comments_son.parent_comment_id, count(*) as s_count, max(new_comments_son.createdAt) as s_time, group_concat(new_comments_son.s_user_info SEPARATOR '|||') as s_r_user_info  from

        (select comments_son.*, concat(ifnull(s_users.avatar,'%empty%'),'%%',s_users.username) as s_user_info from comments_son inner join (select * from users where users.deletedAt is null) as s_users on s_users.id = comments_son.user_id  where comments_son.deletedAt is null) as 
        
        new_comments_son group by new_comments_son.parent_comment_id) as result_comments_son
        -- end

        -- 3
        on result_comments_son.parent_comment_id = new_comments.id  group by new_comments.topic_id


        ) as result_comments on result_comments.topic_id = topics.id

        where topics.deletedAt is null and topics.category = '${category}'
        `
    try {
        var resultTopics = await db.query({
            sqlStr,
            escapeArr: [20]
        });
        var resultCount = await db.query({
            sqlStr: sqlCount,
            escapeArr: []
        });
        if (resultTopics.length > 0) {
            return res.send({
                code: 200,
                msg: "ok",
                data: {
                    topics: resultTopics,
                    pageCount: Math.ceil(resultCount[0].pageCount / limit)
                }
            })
        } else {
            return res.send({
                code: 400,
                msg: "query topics result is null",
                data: ""
            })
        }

    } catch (err) {
        return next(err)
    }
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
    var sqlStr = `
    SELECT 

    topics.*,

    users.username, users.avatar,

    new_topics_like.like_user_id,

    new_topics_collection.collection_user_id

    FROM topics

    INNER JOIN users ON topics.user_id = users.id

    LEFT JOIN (SELECT topics_like.topic_id, GROUP_CONCAT(topics_like.user_id) as like_user_id FROM topics_like WHERE topics_like.deletedAt is NULL GROUP BY topics_like.topic_id) as new_topics_like ON topics.id = new_topics_like.topic_id

    LEFT JOIN (SELECT topics_collection.topic_id, GROUP_CONCAT(topics_collection.user_id) as collection_user_id FROM topics_collection WHERE topics_collection.deletedAt is NULL GROUP BY topics_collection.topic_id) as new_topics_collection ON topics.id = new_topics_collection.topic_id

    WHERE topics.id = ? AND topics.deletedAt is null LIMIT 1`;

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

module.exports.getTopicsOverview = async (req, res, next) => {
    try {
        var sqlStr = `
        SELECT topics.browsed, topics.category, topics.createdAt, topics.id, topics.title, topics.updatedAt, topics.user_id, new_users.avatar, new_users.username, GREATEST(IFNULL(new_comments.time,0),IFNULL(topics.createdAt,0)) as result_time, new_comments.result_count FROM topics 

        INNER JOIN (SELECT * FROM users WHERE users.deletedAt is NULL) as new_users on new_users.id = topics.user_id

        LEFT JOIN
        (

        SELECT comments.topic_id, GREATEST( IFNULL(MAX(comments.createdAt),0) ,IFNULL(MAX(new_comments_son.active_time),0)) as time, COUNT(*)+IFNULL(SUM(new_comments_son.son_count),0)  as result_count  FROM comments

        LEFT JOIN (SELECT comments_son.parent_comment_id, MAX(comments_son.createdAt) as active_time, COUNT(*) as son_count FROM comments_son WHERE comments_son.deletedAt is NULL GROUP BY comments_son.parent_comment_id) as new_comments_son on new_comments_son.parent_comment_id = comments.id

        WHERE comments.deletedAt is NULL GROUP BY comments.topic_id

        ) as new_comments on new_comments.topic_id = topics.id

        WHERE topics.deletedAt is NULL ORDER BY result_time DESC LIMIT ?`;

        var escapeArr = [10]
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

module.exports.insertTopicLike = async (req, res, next) => {
    var {
        topic_id,
        receiver_user_id
    } = req.query

    if (!topic_id) return res.send({
        code: 400,
        msg: "topic_id can not be empty",
        data: ""
    })


    if (!receiver_user_id) return res.send({
        code: 400,
        msg: "receiver_user_id can not be empty",
        data: ""
    })

    var time = new Date().getTime()


    // 先查询客户是否已经点过赞了

    try {
        var result = await db.query({
            sqlStr: "select * from topics_like where user_id = ? and topic_id = ? and deletedAt is null",
            escapeArr: [req.userInfo.id, topic_id]
        })
        if (!result.length > 0) {
            var sqlStr = "insert into topics_like (topic_id, user_id, createdAt) values (?,?,?)"
            var escapeArr = [topic_id, req.userInfo.id, time]
            await db.query({
                sqlStr,
                escapeArr
            })

            // 触发者 不等于 接收者 才执行下面的事件
            if (receiver_user_id != req.userInfo.id) {

                var resultTopic = await db.query({
                    sqlStr: "select * from topics where deletedAt is null and id = ? limit 1",
                    escapeArr: [topic_id]
                })
                await db.query({
                    sqlStr: "insert into notices_like_topic (sender_user_id, sender_avatar, sender_username, receiver_user_id, type, target_id, content, topic_id, isRead, createdAt) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    escapeArr: [req.userInfo.id, req.userInfo.avatar, req.userInfo.username, receiver_user_id, "like_topic", topic_id, resultTopic[0].title, topic_id, 0, time]
                })
            }

        } else {
            await db.query({
                sqlStr: "update topics_like set deletedAt = ? where id = ? ",
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

module.exports.insertTopicCollection = async (req, res, next) => {
    var {
        topic_id
    } = req.params

    if (!topic_id) return res.send({
        code: 400,
        msg: "value can not be empty",
        data: ""
    })

    var time = new Date().getTime()

    // 先查询客户是否已经收藏了

    try {
        var result = await db.query({
            sqlStr: "select * from topics_collection where user_id = ? and topic_id = ? and deletedAt is null",
            escapeArr: [req.userInfo.id, topic_id]
        })
        if (!result.length > 0) {
            var sqlStr = "insert into topics_collection (topic_id, user_id, createdAt) values (?,?,?)"
            var escapeArr = [topic_id, req.userInfo.id, time]
            await db.query({
                sqlStr,
                escapeArr
            })

            var resultCollection = await db.query({
                sqlStr: "select * from topics where deletedAt is null and id = ?",
                escapeArr: [topic_id]
            })

            var receiver_user_id = resultCollection[0].user_id
            var sender_user_id = req.userInfo.id
            if (receiver_user_id != req.userInfo.id) {
                await db.query({
                    sqlStr: "insert into notices_collection_topic (sender_user_id, sender_avatar, sender_username, receiver_user_id, type, target_id, content, topic_id, isRead, createdAt) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    escapeArr: [sender_user_id, req.userInfo.avatar, req.userInfo.username, receiver_user_id, "topic_collection", topic_id, resultCollection[0].title, topic_id, 0, time]
                })
            }


        } else {
            await db.query({
                sqlStr: "update topics_collection set deletedAt = ? where id = ? ",
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

module.exports.deleteTopicById = async (req, res, next) => {
    const {
        topic_id
    } = req.params

    if (!topic_id) return res.send({
        code: 400,
        msg: "value can not be empty",
        data: ""
    })
    try {
        var time = new Date().getTime()
        var result = await db.query({
            sqlStr: 'update topics set deletedAt = ? where id = ? and user_id = ? limit 1',
            escapeArr: [time, topic_id, req.userInfo.id]
        })
        if (!result.affectedRows) {
            return res.send({
                code: 400,
                msg: "err",
                data: ""
            })
        } else {
            return res.send({
                code: 200,
                msg: "ok",
                data: ""
            })
        }
    } catch (err) {
        return next(err)
    }
}


module.exports.getTopicToUpdate = async (req, res, next) => {
    const {
        topic_id
    } = req.params

    if (!topic_id) return res.send({
        code: 400,
        msg: "value can not be empty",
        data: ""
    })

    try {
        var result = await db.query({
            sqlStr: "select * from topics where deletedAt is null and user_id = ? and id =? limit 1",
            escapeArr: [req.userInfo.id, topic_id]
        })

        if (!result.length > 0) {
            return res.send({
                code: 400,
                msg: 'erro',
                data: ''
            })
        } else {
            return res.send({
                code: 200,
                msg: 'ok',
                data: result[0]
            })
        }
    } catch (err) {
        return next(err)
    }
}

module.exports.updateTopicById = async (req, res, next) => {
    var {
        topic_id
    } = req.params
    var {
        title,
        content,
        category
    } = req.body;

    var result = methodSets.isNull(title, content, category, topic_id)

    var isOver = title.length > 50 ? false : true

    if (!result && isOver) {
        return res.send({
            code: 400,
            msg: "value can not be empty",
            data: ""
        })
    }
    title = xss(title)
    content = xss(content)

    var time = new Date().getTime()
    try {
        var result = await db.query({
            sqlStr: 'update topics set content = ?, title = ?, category = ?, updatedAt = ? where id = ? and user_id = ? limit 1',
            escapeArr: [content, title, category, time, topic_id, req.userInfo.id]
        })

        if (result.affectedRows > 0) {
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

    } catch (err) {
        return next(err)
    }
}


module.exports.addTopicBrowsed = async (req, res, next) => {
    var {
        topic_id
    } = req.body
    try {
        var result = await db.query({
            sqlStr: "UPDATE topics SET browsed = (browsed+1) WHERE deletedAt is NULL AND id = ?",
            escapeArr: [topic_id]
        })
        if (result.affectedRows > 0) {
            return res.send({
                code: 200,
                msg: "ok",
                data: ""
            })
        } else {
            return res.send({
                code: 400,
                msg: " update browsed table result is no affectedRows"
            })
        }


    } catch (err) {
        console.log(err)
        return next(err)
    }
}

module.exports.getTopicByDefaultUserId = async (req, res, next) => {
    var {
        pageIndex
    } = req.query
    if (!pageIndex || pageIndex < 1) pageIndex = 1
    var limit = 20;
    var start = (pageIndex - 1) * limit
    try {
        var resultTopics = await db.query({
            sqlStr: `select * from topics where deletedAt is null and user_id = ? ORDER BY createdAt DESC limit ${start}, ${limit}`,
            escapeArr: [req.userInfo.id]
        })
        var resultCount = await db.query({
            sqlStr: "select count(*) as count from topics where deletedAt is null and user_id = ?",
            escapeArr: [req.userInfo.id]
        })
        if (resultTopics.length > 0) {
            return res.send({
                code: 200,
                msg: "ok",
                data: {
                    topics: resultTopics,
                    pageCount: Math.ceil(resultCount[0].count / limit)
                }
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

module.exports.getTopicByUserId = async (req, res, next) => {
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
    var {
        pageIndex
    } = req.query
    if (!pageIndex || pageIndex < 1) pageIndex = 1
    var limit = 20;
    var start = (pageIndex - 1) * limit

    try {
        var resultTopics = await db.query({
            sqlStr: `select * from topics where deletedAt is null and user_id = ? ORDER BY createdAt DESC limit ${start}, ${limit}`,
            escapeArr: [user_id]
        })
        var resultCount = await db.query({
            sqlStr: "select count(*) as count from topics where deletedAt is null and user_id = ?",
            escapeArr: [user_id]
        })
        if (resultCount.length > 0) {
            return res.send({
                code: 200,
                msg: "ok",
                data: {
                    topics: resultTopics,
                    pageCount: Math.ceil(resultCount[0].count / limit)
                }
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

module.exports.getCategoryWeekCount = async (req, res, next) => {
    try {
        var result = await db.query({
            sqlStr: "SELECT category, COUNT(*) as WeekCount  FROM topics WHERE deletedAt is NULL AND YEARWEEK(FROM_UNIXTIME(SUBSTRING(createdAt,1,10),'%Y-%m-%d %h:%m:%s')) = YEARWEEK(now()) GROUP BY category",
            escapeArr: []
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
                msg: "query category WeekCount is null",
                data: ""
            })
        }
    } catch (err) {
        return next(err)
    }
}

module.exports.getCategoryRecentCount = async (req, res, next) => {
    try {
        var result = await db.query({
            sqlStr: "SELECT category, COUNT(*) as recentCount FROM topics WHERE deletedAt is NULL AND DATE_SUB(CURDATE(), INTERVAL 3 DAY) <= FROM_UNIXTIME(SUBSTRING(createdAt,1,10),'%Y-%m-%d') GROUP BY category",
            escapeArr: []
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
                msg: "query category RecentCount is null",
                data: ""
            })
        }
    } catch (err) {
        return next(err)
    }
}