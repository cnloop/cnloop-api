var express = require('express')

var router = express.Router()

var register = require('../controllers/register')

router.post('/', register.createUser)

module.exports = router