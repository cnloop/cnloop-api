var express = require('express')

var router = express.Router()

var check = require('./check')

var user = require('../controllers/user')



router.get("/getUserInfoByUserId/:user_id", user.getUserInfoByUserId)

router.get("/getAllCountById/:user_id", user.getAllCountById)

router.post("/updateUserInfo", check.isLogin, user.updateUserInfo)

module.exports = router