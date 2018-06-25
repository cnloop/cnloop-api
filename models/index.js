var mysql = require("mysql");

var config = require('../config')

var pool = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

exports.query = sqlStr => {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) return reject(err);
            // Use the connection
            connection.query(sqlStr, function (error, results, fields) {
                // And done with the connection.
                connection.release();
                // Handle error after the release.
                if (error) return reject(error);
                // Don't use the connection here, it has been returned to the pool.
                resolve(results);
            });
        });
    });
};