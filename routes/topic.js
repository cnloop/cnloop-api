var express = require('express')

var router = express.Router()

var check = require('./check')

var topic = require('../controllers/topic')

router.post('/', check.isLogin, topic.createTopic)

router.post("/uploadImage", check.isLogin, topic.uploadImage)

router.get('/list', topic.getTopicList)

router.get('/getTopicByDefaultUserId', check.isLogin, topic.getTopicByDefaultUserId)

router.get('/getTopicByUserId/:user_id', topic.getTopicByUserId)

router.get("/getCategoryWeekCount", topic.getCategoryWeekCount)

router.get("/getCategoryRecentCount", topic.getCategoryRecentCount)


router.get('/:id', topic.getTopicById)

router.get('/show/overview', topic.getTopicsOverview)


router.post('/like', check.isLogin, topic.insertTopicLike)


router.post('/collection/:topic_id', check.isLogin, topic.insertTopicCollection)

router.delete('/delete/:topic_id', check.isLogin, topic.deleteTopicById)

router.get('/getTopicToUpdate/:topic_id', check.isLogin, topic.getTopicToUpdate)

router.patch('/updateTopicById/:topic_id', check.isLogin, topic.updateTopicById)


module.exports = router