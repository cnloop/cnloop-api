var express = require('express')

var router = express.Router()

var check = require('./check')

var follow = require('../controllers/follow')

router.post("/", check.isLogin, follow.changeFollowingStatus)


router.get('/getFollowingList', follow.getFollowingList)

// 查看某人一共有多少粉丝，并返回粉丝的相关个人信息
router.get("/getTargetFollowersList/:following_user_id", follow.getTargetFollowersList)

module.exports = router