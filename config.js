var path = require('path')

var config = {
    port: 3000,
    mysql: {
        host: "localhost",
        user: "root",
        password: "209E8znR_u",
        // password: "123456",

        database: "cnloop"
    },
    github: {
        client_id: '8a98ceca42bdf7bd689e',
        client_secret: '5adfa71dd1f901d0e302d92dea865a8065a676c2'
    },
    qiniu: {
        access_key: 'L7X7eojDl72gbe8ub84LTck8U1p30zZWfr99LLRV',
        secret_key: 'xCUSO6s1gWCjKQkmDViscb_lTWiZM6oRacu9vyNN',
        bucket: "cnloop",
        domain: "http://pbucd2xph.bkt.clouddn.com"
    }
}

module.exports = config