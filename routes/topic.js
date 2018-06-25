var express = require('express')

var router = express.Router()

var check = require('./check')

var topic = require('../controllers/topic')

router.post('/', check.isLogin, topic.createTopic)

module.exports = router