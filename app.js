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

    console.log('router ==>' + req.url)
    var token = req.headers['authorization'];
    console.log('token ==>' + token)
    if (token) {
        jwt.verify(token, "cnloop", function (err, decoded) {
            if (err) {
                console.log("--");
                console.log(err);
                return res.send({
                    code: 403,
                    msg: 'err',
                    data: ''
                })
            } else {
                console.log('===' + decoded);
                console.log('222')
                req.isVerified = true;
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
    console.log(err);
    return res.send({
        code: 400,
        msg: '网络不佳，稍后再试...',
        data: ''
    })
})

app.listen(config.port, function () {
    console.log(`app is running...port is ${config.port}`)
})