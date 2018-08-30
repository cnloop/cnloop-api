var express = require('express')

var cors = require('cors')

var config = require('./config')

var bodyParser = require("body-parser")

var mount = require('mount-routes')

var path = require('path')

var jwt = require("jsonwebtoken");

var app = express()

app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());

app.use(function (req, res, next) {
    var token = req.headers['authorization'];
    if (token) {
        jwt.verify(token, "cnloop", function (err, decoded) {
            if (err) {
                return res.send({
                    code: 403,
                    msg: 'err',
                    data: ''
                })
            } else {
                req.userInfo = decoded;
                return next();
            }
        });
    } else {
        return next();
    }

})

mount(app, path.join(__dirname, 'routes'), true);

app.use((err, req, res, next) => {
    console.dir(err);
    return res.send({
        code: 400,
        msg: '中间层转 err....',
        data: ''
    })
})

app.listen(config.port, function () {
    console.log(`app is running...port is ${config.port}`)
})