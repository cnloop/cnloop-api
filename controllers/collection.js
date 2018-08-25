var db = require('../models')


module.exports.getCollectionListByUserId = async (req, res, next) => {
    var {
        user_id
    } = req.params

    if (!user_id) return res.send({
        code: 400,
        msg: "user_id is null",
        data: ""
    })

    try {
        var result = await db.query({
            sqlStr: "select topics_collection.*, new_topics.title, new_topics.category from topics_collection inner join (select * from topics where deletedAt is null) as new_topics on new_topics.id = topics_collection.topic_id  where topics_collection.deletedAt is null and topics_collection.user_id = ?",
            escapeArr: [user_id]
        })
        if (result.length > 0) {
            return res.send({
                code: 200,
                msg: "query is ok",
                data: result
            })
        } else {
            return res.send({
                code: 400,
                msg: "result is null",
                data: ""
            })
        }
    } catch (err) {
        return next(err)
    }
}