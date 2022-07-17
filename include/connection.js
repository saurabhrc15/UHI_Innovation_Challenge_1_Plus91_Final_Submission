const mysql = require('mysql');
const util = require('util');

// UAT
const pool = mysql.createPool({
    connectionLimit : 500,
    host: "localhost",
    user: "root",
    password: "plus91",
    database: "uhi_hackathon",
    port: 3306,
    dateStrings: true,
    timezone: '+05:30'
})

// Live
// const pool = mysql.createPool({
//     connectionLimit : 500,
//     host: "54.245.221.211",
//     user: "angpro91",
//     password: "Hs&056ZA",
//     database: "uhi_eua_hackathon",
//     port: 3306,
//     dateStrings: true,
//     timezone: '+05:30'
// })

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release();
    return
})

pool.on('connection', (connection) => {
    let SqlString = require('mysql/lib/protocol/SqlString');
    connection.config.queryFormat = connection.config.queryFormat = function (sql, values, timeZone) {
        sql = SqlString.format(sql, values, false, timeZone);
        sql = sql.replace(/'NOW\(\)'/g, 'NOW(6)');
        return sql;
    };
});

pool.query = util.promisify(pool.query)

module.exports = pool