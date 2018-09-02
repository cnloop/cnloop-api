var express = require('express')

var router = express.Router()

var check = require('./check')

var notice = require('../controllers/notice')

router.get("/getNotices", check.isLogin, notice.getNotices)

router.get("/getNoticeCount", check.isLogin, notice.getNoticeCount)

router.get("/updateIsReadStatus", check.isLogin, notice.updateIsReadStatus)

module.exports = router