var express = require('express')

var router = express.Router()

var check = require('./check')

var search = require('../controllers/search')

router.get("/getResult/:searchKey", search.getResult)

module.exports = router