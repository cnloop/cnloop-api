var path = require('path')

var config = {
    port: 3000,
    mysql: {
        host: "localhost",
        user: "root",
        password: "123456",
        database: "cnloop"
    },
    github: {
        client_id: '8a98ceca42bdf7bd689e',
        client_secret: '5adfa71dd1f901d0e302d92dea865a8065a676c2'
    }
}

module.exports = config