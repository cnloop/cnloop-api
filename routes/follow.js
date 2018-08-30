var express = require('express')

var router = express.Router()

var check = require('./check')

var follow = require('../controllers/follow')

router.post("/", check.isLogin, follow.changeFollowingStatus)


router.get('/getFollowingList', follow.getFollowingList)

// 查看某人一共有多少粉丝，并返回粉丝的相关个人信息
router.get("/getTargetFollowersList/:following_user_id", follow.getTargetFollowersList)

router.get("/getTargetFollowersListByDefault", check.isLogin, follow.getTargetFollowersListByDefault)

// 查看某人正在关注的用户，并返回用户的相关个人信息
router.get("/getTargetfollowingList/:user_id", follow.getTargetfollowingList)

router.get("/getTargetfollowingListByDefault", check.isLogin, follow.getTargetfollowingListByDefault)

module.exports = router