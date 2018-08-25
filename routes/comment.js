var express = require('express')

var router = express.Router()

var check = require('./check')

var comment = require('../controllers/comment')

router.post("/", check.isLogin, comment.createComment)

router.post("/comment_son", check.isLogin, comment.createCommentSon)

router.post("/like_comment/:commentId", check.isLogin, comment.insertCommentLike)


router.post("/like_comment_son/:commentSonId", check.isLogin, comment.insertCommentSonLike)

router.get("/list/:topicId", comment.getCommentList)

router.get("/getCommentByDefaultUserId", check.isLogin, comment.getCommentByDefaultUserId)

router.get("/getCommentByUserId/:user_id",comment.getCommentByUserId)


module.exports = router