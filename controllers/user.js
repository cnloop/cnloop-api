var db = require('../models')

var fs = require("fs")

var path = require("path")

var formidable = require("formidable")

var qiniu = require('node-qiniu')

var config = require("../config")

var xss = require('xss');




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


qiniu.config({
    access_key: config.qiniu.access_key,
    secret_key: config.qiniu.secret_key
})

var imagesBucket = qiniu.bucket(config.qiniu.bucket);

function getFile(req) {
    return new Promise((res, rej) => {
        var form = new formidable.IncomingForm();
        form.uploadDir = path.join(process.cwd(), "uploads")
        form.maxFileSize = 200 * 1024;
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



module.exports.updateUserInfo = async (req, res, next) => {
    try {
        var resultGetFile = await getFile(req)
        if (!resultGetFile.files.file.path) {
            var resultUpdateNM = await db.query({
                sqlStr: "update users set nickname = ?, motto = ? where deletedAt is null and id =?",
                escapeArr: [xss(resultGetFile.fields.nickname), xss(resultGetFile.fields.motto), req.userInfo.id]
            })
            if (!resultUpdateNM.affectedRows) {
                return res.send({
                    code: 400,
                    msg: "mysql update app is crash...",
                    data: ""
                })
            }

        } else {
            var fileName = `${new Date().getTime()}.png`
            var newPath = path.join(process.cwd(), 'uploads', fileName)
            var resultFileReName = await fileReName(resultGetFile.files.file.path, newPath)
            var resultUploadQiNiu = await uploadQiNiu(fileName, newPath)
            fs.unlinkSync(newPath)
            var resultUpdateDB = await db.query({
                sqlStr: "update users set nickname = ?, motto = ?, avatar = ? where deletedAt is null and id = ?",
                escapeArr: [xss(resultGetFile.fields.nickname), xss(resultGetFile.fields.motto), `${config.qiniu.domain}/${fileName}`, req.userInfo.id]
            })
            if (!resultUpdateDB.affectedRows) {
                return res.send({
                    code: 400,
                    msg: "mysql update app is crash...",
                    data: ""
                })
            }
        }



        var resultSearchUser = await db.query({
            sqlStr: "select * from users where deletedAt is null and id = ? limit 1",
            escapeArr: [req.userInfo.id]
        })

        if (resultSearchUser.length > 0) {
            return res.send({
                code: 200,
                msg: "ok",
                data: resultSearchUser[0]
            })
        } else {
            return res.send({
                code: 400,
                msg: "search user info result is null",
                data: ""
            })
        }

    } catch (err) {
        return next(err)
    }
}