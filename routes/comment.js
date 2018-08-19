var express = require('express')

var router = express.Router()

var check = require('./check')

var comment = require('../controllers/comment')

router.post("/", check.isLogin, comment.createComment)

router.post("/comment_son", check.isLogin, comment.createCommentSon)


router.get("/list/:topicId",comment.getCommentList)

module.exports = router
