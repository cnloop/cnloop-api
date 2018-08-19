var express = require('express')

var router = express.Router()

var check = require('./check')

var login = require('../controllers/login')

router.post('/', login.createToken)

router.get('/markLoginStatus', check.isLogin, login.markLoginStatus)

module.exports = router