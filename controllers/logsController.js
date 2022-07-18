const pool = require('../include/connection');
const { v4: uuidv4 } = require('uuid');

exports.addLogs = function (data) {
    try {
        let date = new Date();
        let myObj = {
            url: data.url,
            created_datetime: date,
            request_datetime: data.request_datetime?data.request_datetime:date,
            response_datetime: data.response_datetime,
            request_body: data.body,
            response: data.response,
            transaction_id: data.transaction_id,
            is_deleted: 0
        }
        let query = `INSERT INTO logs SET ?`;
        pool.query(query, myObj, function (error, res) {
            if(error)
            {
                console.log("Log Error : ",error);
            }
            else
            {
                console.log("Log Added : ",res)
            }
        });
    } catch (err) {
        console.log("Log Catch : ",err);
    }
}