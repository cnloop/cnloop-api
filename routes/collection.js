var express = require('express')

var router = express.Router()

var check = require('./check')

var collection = require('../controllers/collection')

router.get("/getCollectionListByUserId/:user_id", collection.getCollectionListByUserId)

router.get("/getCollectionListByDefault", check.isLogin, collection.getCollectionListByDefault)

module.exports = router