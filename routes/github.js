var express = require('express')

var router = express.Router()

var github = require('../controllers/github')

router.get('/', github.verify)

module.exports = router