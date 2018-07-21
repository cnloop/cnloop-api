var mysql = require("mysql");

var config = require('../config')

var pool = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

// 传入每个sql语句item对象，item对象包含属性sql语句，需要被转义的参数数组
module.exports.query = item => {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) return reject(err);
            // Use the connection
            connection.query(item.sqlStr, item.escapeArr, function (error, results, fields) {
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




const methodSets = {
    steps(connection, item) {
        return new Promise((resolve, reject) => {
            connection.query(item.sqlStr, item.escapeArr, function (error, results, fields) {
                connection.release();
                if (error) return reject(error);
                resolve(results);
            });
        })
    }
}

// 传入每条sql的item对象
module.exports.transaction = (...values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection(async (err, connection) => {
            if (err) reject(err);
            var result = [];
            for (var i = 0; i < values.length; i++) {
                if (i == values.length - 1) {
                    try {
                        result.push(await methodSets.steps(connection, i))
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(function () {
                                    throw err;
                                });
                            }
                            console.log('transaction is success!');
                            resolve(result);
                        });
                    } catch (err) {
                        connection.rollback(() => {
                            reject(err)
                        });
                    }
                } else {
                    try {
                        result.push(await methodSets.steps(connection, i))
                    } catch (err) {
                        connection.rollback(() => {
                            reject(err)
                        });
                    }
                }

            }
        })
    })
}