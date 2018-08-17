var express = require('express')

var router = express.Router()

var check = require('./check')

var topic = require('../controllers/topic')

router.post('/', check.isLogin, topic.createTopic)

// router.get('/list', topic.getTopicList)

router.get('/:id', topic.getTopicById)


router.get('/show/overview', topic.getTopicsByDefault)






module.exports = router