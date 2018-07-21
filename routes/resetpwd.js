var express = require('express')

var router = express.Router()

var resetPwd = require('../controllers/resetpwd')

router.post('/', resetPwd.sendEmail)

router.post('/update', resetPwd.updatePwd)


module.exports = router