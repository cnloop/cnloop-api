var express = require('express')

var router = express.Router()

var check = require('./check')

var like = require('../controllers/like')

router.get("/getLikeListByLoad", check.isLogin, like.getLikeListByLoad)

module.exports = router