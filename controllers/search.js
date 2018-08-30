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


module.exports.getResult = async (req, res, next) => {
    var {
        searchKey
    } = req.params

    if (!searchKey) return res.send({
        code: 400,
        msg: "searchKey is null",
        data: ""
    })

    try {
        var result = await db.query({
            sqlStr: "select topics.*, u.avatar, u.username from topics inner join (select * from users where deletedAt is null) as u on u.id = topics.user_id where topics.deletedAt is null and topics.title like ? or topics.content like ?",
            escapeArr: [`%${searchKey}%`, `%${searchKey}%`]
        })
        if (result.length > 0) {
            res.send({
                code: 200,
                msg: "ok",
                data: result
            })
        } else {
            res.send({
                code: 400,
                msg: "search result is null...",
                data: ""
            })
        }
    } catch (err) {
        next(err)
    }
}