var express = require('express')

var router = express.Router()

var check = require('./check')

var user = require('../controllers/user')

router.get("/getUserInfoByUserId/:user_id",  user.getUserInfoByUserId)

module.exports = router