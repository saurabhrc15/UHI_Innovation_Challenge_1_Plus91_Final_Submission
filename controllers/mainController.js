const pool = require('../include/connection');
const addLogs = require('./logsController');
const { v4: uuidv4 } = require('uuid');
var request = require('request');
var io = require('socket.io-client');
var socket = io.connect(process.env.SOCKET_URL);
// const { NerManager } = require('node-nlp');
const { NlpManager } = require('node-nlp');
var fs=require('fs');

// var tt;

// async function nlp(str,data, res)
// {
//     try{
//         const manager = new NlpManager({ languages: ['en'] });
//         var categoriesFilePath = "dataset/search_categories.json";
//         if (fs.existsSync(categoriesFilePath)) {
//             var symptomData = JSON.parse(fs.readFileSync(categoriesFilePath,'utf8'))
//             for(let i in symptomData)
//             {
//                 manager.addNamedEntityText(symptomData[i]["entity"], symptomData[i]["name"], ['en'], symptomData[i]["similar_names"] );
//             }   
//         }
//         phrasesFilePath = "dataset/search_phrases.json";
//         if (fs.existsSync(phrasesFilePath)) {
//             var phrasesData = JSON.parse(fs.readFileSync(phrasesFilePath,'utf8'))
//             for(let i in phrasesData)
//             {
//                 manager.addDocument('en', phrasesData[i]["phrase"], phrasesData[i]["search_entity"]);
//             }   
//         }
//         await manager.train();
//         manager
//         .process(str)
//         .then(result => {
//             showData(result,data);
//             return 0;
//         });
//     } catch (err) {
//         log.info(err);
//         console.log(err);
//         console.error(err);
//     }
// }

// exports.nlp = async function (req, res) {
//     // global tt : any;
//     // var entitiesArr;
//     const manager = new NlpManager({ languages: ['en'] });
//     // manager.addNamedEntityText('hero', 'spiderman', ['en'], ['Spiderman', 'Spider-man'], );
//     // manager.addNamedEntityText('hero', 'iron man', ['en'], ['iron man', 'iron-man'], );
//     // manager.addNamedEntityText('hero', 'thor', ['en'], ['Thor']);
//     // manager.addNamedEntityText('food', 'burguer', ['en'], ['Burguer', 'Hamburguer'], );
//     // manager.addNamedEntityText('food', 'pizza', ['en'], ['pizza']);
//     // manager.addNamedEntityText('food', 'pasta', ['en'], ['Pasta', 'spaghetti']);

//     // manager.addDocument('en', 'I saw %hero% eating %food%', 'sawhero');
//     // manager.addDocument('en','I have seen %hero%, he was eating %food%','sawhero',);
//     // manager.addDocument('en', 'I want to eat %food%', 'wanteat');


//     // manager.addNamedEntityText('symptom', 'cough', ['en'], ['Cough', 'cough'], );
//     // manager.addNamedEntityText('symptom', 'fever', ['en'], ['Fever', 'fever'], );
//     // manager.addNamedEntityText('symptom', 'cold', ['en'], ['Cold', 'cold'], );

//     var categoriesFilePath = "dataset/search_categories.json";
//     if (fs.existsSync(categoriesFilePath)) {
//         var symptomData = JSON.parse(fs.readFileSync(categoriesFilePath,'utf8'))
//         for(let i in symptomData)
//         {
//             manager.addNamedEntityText(symptomData[i]["entity"], symptomData[i]["name"], ['en'], symptomData[i]["similar_names"] );
//         }   
//     }
//     phrasesFilePath = "dataset/search_phrases.json";
//     if (fs.existsSync(phrasesFilePath)) {
//         var phrasesData = JSON.parse(fs.readFileSync(phrasesFilePath,'utf8'))
//         for(let i in phrasesData)
//         {
//             manager.addDocument('en', phrasesData[i]["phrase"], phrasesData[i]["search_entity"]);
//         }   
//     }
//     await manager.train();

//     manager
//     .process('I have cough adn fever.')
//     .then(result => {
//         // console.log(result.entities)
//         // tt = result.entities;
//         showData(result)
//     });
//     res.status(200).json({"HI":"HI"});
// }

function showData(result,data, transactionId,messageId,request_datetime)
{
    var speciality = "";
    var symptom = "";
    var service = "";
    var location = "";
    var language = "";
    var education = "";
    var experience = "";
    
    for(var i in result.entities)
    {
        if(result.entities[i]["entity"]=="speciality")
        {
            speciality += result.entities[i]["option"]
        }
        else if(result.entities[i]["entity"]=="symptom")
        {
            symptom += result.entities[i]["option"]
        }
        else if(result.entities[i]["entity"]=="service")
        {
            service += result.entities[i]["option"]
        }
        else if(result.entities[i]["entity"]=="location")
        {
            location += result.entities[i]["option"]
        }
        else if(result.entities[i]["entity"]=="language")
        {
            language = language==""?result.entities[i]["option"]:","+result.entities[i]["option"];
        }
    }
    
    var intentData = {};
    
    intentData.type = data.type;
    intentData.agent = {
        "tags": {
            "@abdm/gov/in/experience": experience,
            "@abdm/gov/in/languages": language,
            "@abdm/gov/in/speciality": speciality,
            "@abdm/gov/in/education": education
        }
    };
    
    var date = {}
    if(data.start_date)
    {
        date["start"]= {
            "time": {
                "timestamp": `${data.start_date}T00:00:00`
            }
        }
    }
    if(data.end_date)
    {
        date["end"]= {
            "time": {
                "timestamp": `${data.end_date}T00:00:00`
            }
        }
    }
    
    intentData.fulfillment = {
        date
    }
    
    console.log(JSON.stringify(intentData));
    
    params = {
        "context": {
            "domain": "Health",
            "country": "IND",
            "city": "Pune",
            "action": "search",
            "timestamp": new Date(),
            "core_version": "0.7.1",
            "consumer_id": `${process.env.CONSUMER_ID}`,
            "consumer_uri": `${process.env.CALLBACK_URL}`,
            "transaction_id": transactionId,
            "message_id": messageId
        },
        "message": {
            "intent": {
                "fulfillment": {
                    "type": "Teleconsultation",
                    "agent": {
                        "name": "vijay"
                    }
                }
            },
            "order": null,
            "catalog": null,
            "order_id": null
        }
    }
    
    // params = {
    //     "context": {
    //         "domain": "Health",
    //         "country": "IND",
    //         "city": "Pune",
    //         "action": "search",
    //         "timestamp": new Date(),
    //         "core_version": "0.7.1",
    //         "consumer_id": `${process.env.CONSUMER_ID}`,
    //         "consumer_uri": `${process.env.CALLBACK_URL}`,
    //         "transaction_id": transactionId,
    //         "message_id": messageId
    //     },
    //     "message": {
    //         "intent": intentData
    //     }
    // }
    
    console.log(params);
    
    var url = `${process.env.GATEWAY_URL}/search`;
    request.post({
        url: url,
        body: params,
        json: true
    }, function(err, response, body){
        var response = {
            success: true,
            transaction_id: transactionId,
            message_id: messageId,
            body
        };
        addLogs.addLogs({
            url: '/search',
            body: JSON.stringify(params),
            response: JSON.stringify(response),
            request_datetime: request_datetime,
            response_datetime: new Date(),
            transaction_id: transactionId
        });
        res.status(200).json(response)
        return {
            success: true,
            transaction_id: transactionId,
            message_id: messageId,
            body
        };
    });
}

exports.search = async function (req, res) {
    let params = {}
    try {
        var request_datetime = new Date();
        const transactionId = uuidv4();
        const messageId = uuidv4();
        var data = req.body;
        
        const manager = new NlpManager({ languages: ['en'] });
        var categoriesFilePath = "dataset/search_categories.json";
        if (fs.existsSync(categoriesFilePath)) {
            var symptomData = JSON.parse(fs.readFileSync(categoriesFilePath,'utf8'))
            for(let i in symptomData)
            {
                manager.addNamedEntityText(symptomData[i]["entity"], symptomData[i]["name"], ['en'], symptomData[i]["similar_names"] );
            }   
        }
        phrasesFilePath = "dataset/search_phrases.json";
        if (fs.existsSync(phrasesFilePath)) {
            var phrasesData = JSON.parse(fs.readFileSync(phrasesFilePath,'utf8'))
            for(let i in phrasesData)
            {
                manager.addDocument('en', phrasesData[i]["phrase"], phrasesData[i]["search_entity"]);
            }   
        }
        await manager.train();
        manager
        .process(data.searchvalue)
        .then(result => {
            // showData(result,data,transactionId,messageId,request_datetime);
            // console.log("responseData",responseData);
            
            var speciality = "";
            var symptom = "";
            var service = "";
            var location = "";
            var language = "";
            var education = "";
            var experience = "";
            
            for(var i in result.entities)
            {
                if(result.entities[i]["entity"]=="speciality")
                {
                    speciality += result.entities[i]["option"]
                }
                else if(result.entities[i]["entity"]=="symptom")
                {
                    symptom += result.entities[i]["option"]
                }
                else if(result.entities[i]["entity"]=="service")
                {
                    service += result.entities[i]["option"]
                }
                else if(result.entities[i]["entity"]=="location")
                {
                    location += result.entities[i]["option"]
                }
                else if(result.entities[i]["entity"]=="language")
                {
                    language += result.entities[i]["option"];
                }
            }
            
            var intentData = {};
            
            intentData.type = data.type;
            intentData.agent = {
                "tags": {
                    "@abdm/gov/in/experience": experience,
                    "@abdm/gov/in/languages": language,
                    "@abdm/gov/in/speciality": speciality,
                    "@abdm/gov/in/education": education
                }
            };
            
            var date = {}
            if(data.start_date)
            {
                date["start"]= {
                    "time": {
                        "timestamp": `${data.start_date}T00:00:00`
                    }
                }
            }
            if(data.end_date)
            {
                date["end"]= {
                    "time": {
                        "timestamp": `${data.end_date}T00:00:00`
                    }
                }
            }
            
            intentData.fulfillment = {
                date
            }
            
            console.log(JSON.stringify(intentData));
            
            params = {
                "context": {
                    "domain": "Health",
                    "country": "IND",
                    "city": "Pune",
                    "action": "search",
                    "timestamp": new Date(),
                    "core_version": "0.7.1",
                    "consumer_id": `${process.env.CONSUMER_ID}`,
                    "consumer_uri": `${process.env.CALLBACK_URL}`,
                    "transaction_id": transactionId,
                    "message_id": messageId
                },
                "message": {
                    "intent": intentData
                }
            }
            
            console.log(params);
            
            var url = `${process.env.GATEWAY_URL}/search`;
            request.post({
                url: url,
                body: params,
                json: true
            }, function(err, response, body){
                var response = {
                    success: true,
                    transaction_id: transactionId,
                    message_id: messageId,
                    body
                };
                addLogs.addLogs({
                    url: '/search',
                    body: JSON.stringify(params),
                    response: JSON.stringify(response),
                    request_datetime: request_datetime,
                    response_datetime: new Date(),
                    transaction_id: transactionId
                });
                res.status(200).json(response)
                return {
                    success: true,
                    transaction_id: transactionId,
                    message_id: messageId,
                    body
                };
            });
        });
        
        // return;
        
        
        /*var intentData = {};
        
        intentData.type = "Teleconsultation";
        intentData.agent = {
            "name": "mohit"
        };
        
        var date = {}
        if(data.start_date)
        {
            date["start"]= {
                "time": {
                    "timestamp": `${data.start_date}T00:00:00`
                }
            }
        }
        if(data.end_date)
        {
            date["end"]= {
                "time": {
                    "timestamp": `${data.end_date}T00:00:00`
                }
            }
        }
        
        
        intentData.fulfillment = {
            date
        }
        
        console.log(JSON.stringify(intentData));*/
        
        // params = {
        //     "context": {
        //         "domain": "Health",
        //         "country": "IND",
        //         "city": "Pune",
        //         "action": "search",
        //         "timestamp": new Date(),
        //         "core_version": "0.7.1",
        //         "consumer_id": `${process.env.CONSUMER_ID}`,
        //         "consumer_uri": `${process.env.CALLBACK_URL}`,
        //         "transaction_id": transactionId,
        //         "message_id": messageId
        //     },
        //     "message": {
        //         "intent": {
        //             "fulfillment": {
        //                 "type": "Teleconsultation",
        //                 "agent": {
        //                     "name": "vijay"
        //                 },
        //                 "start": {
        //                     "time": {
        //                         "timestamp": "2022-07-13T13:24:20"
        //                     }
        //                 },
        //                 "end": {
        //                     "time": {
        //                         "timestamp": "2022-07-17T23:59:59"
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
        
        /*
        "fulfillment": {
            "type": "Teleconsultation",
            "agent": {
                "name": "mohit"
            },
            "start": {
                "time": {
                    "timestamp": "2022-07-13T13:24:20"
                }
            },
            "end": {
                "time": {
                    "timestamp": "2022-07-17T23:59:59"
                }
            }
        }
        */
        
        // var url = `${process.env.GATEWAY_URL}/search`;
        // request.post({
        //     url: url,
        //     body: params,
        //     json: true
        // }, function(err, response, body){
        //     var response = {
        //         success: true,
        //         transaction_id: transactionId,
        //         message_id: messageId,
        //         body
        //     };
        //     addLogs.addLogs({
        //         url: '/search',
        //         body: JSON.stringify(params),
        //         response: JSON.stringify(response),
        //         request_datetime: request_datetime,
        //         response_datetime: new Date(),
        //         transaction_id: transactionId
        //     });
        //     res.status(200).json(response)
        // });
    } catch (err) {
        log.info(err);
        console.log(err);
        console.error(err);
        
        var response = {
            success: false,
            error: err
        };
        addLogs.addLogs({
            url: '/search',
            body: JSON.stringify(params),
            response: JSON.stringify(response),
            response_datetime: new Date(),
            message_id: messageId,
            transaction_id: transactionId
        });
        res.status(500).json(response);
    }
}

exports.on_search = async function (req, res) {
    try {
        var data = req.body;
        var transaction_id = null;
        var message_id = null;
        var status = 0;
        var response = {
            error: {},
            message: {}
        };
        // console.log("-----------> 1 /on_search");
        // console.log(req.body);
        if(data.hasOwnProperty("context"))
        {
            transaction_id = data.context.transaction_id;
            message_id = data.context.message_id;
            status = 200;
            response.message = {
                ack: {
                    status: "ACK"
                }
            }
            socket.emit('on_search',req.body);
        }
        else
        {
            status = 500;
            response.error = {
                type: 404,
                code: "Invalid Request",
                path: "/on_search",
                message: "Context body missing"
            };
        }
        // console.log("-----------> 2 /on_search");
        if(transaction_id!=null)
        {
            addLogs.addLogs({
                url: '/on_search',
                body: JSON.stringify(data),
                response: JSON.stringify(response),
                response_datetime: new Date(),
                transaction_id: transaction_id,
                message_id: message_id,
            });
        }
        else
        {
            addLogs.addLogs({
                url: '/on_search',
                body: JSON.stringify(data),
                response: JSON.stringify(response),
                response_datetime: new Date(),
            });
        }
        // console.log("-----------> 3 /on_search");
        // console.log(response);
        res.status(status).json(response);
    } catch (err) {
        log.info(err);
        console.log("/on_search");
        console.log(err);
        console.error(err);
        res.status(500).json({
            error: {
                "type": err.type,
                "code": err.code,
                "path": "/on_search",
                "message": err.msg
            },
            message: {}
        });
    }
}

exports.on_confirm = async function (req, res) {
    try {
        var data = req.body;
        var transaction_id = null;
        var message_id = null;
        var status = 0;
        var response = {
            error: {},
            message: {}
        };
        if(data.hasOwnProperty("context"))
        {
            transaction_id = data.context.transaction_id;
            message_id = data.context.message_id;
            status = 200;
            response.message = {
                ack: {
                    status: "ACK"
                }
            }
            socket.emit('on_confirm',req.body);
        }
        else
        {
            status = 500;
            response.error = {
                type: 404,
                code: "Invalid Request",
                path: "/on_search",
                message: "Context body missing"
            };
        }
        if(transaction_id!=null)
        {
            addLogs.addLogs({
                url: '/on_confirm',
                body: JSON.stringify(data),
                response: JSON.stringify(response),
                response_datetime: new Date(),
                transaction_id: transaction_id,
                message_id: message_id,
            });
        }
        else
        {
            addLogs.addLogs({
                url: '/on_confirm',
                body: JSON.stringify(data),
                response: JSON.stringify(response),
                response_datetime: new Date(),
            });
        }
        
        res.status(status).json(response);
    } catch (err) {
        log.info(err);
        res.status(500).json({
            error: {
                "type": err.type,
                "code": err.code,
                "path": "/on_search",
                "message": err.msg
            },
            message: {}
        });
    }
}

exports.on_init = async function (req, res) {
    try {
        var data = req.body;
        var transaction_id = null;
        var message_id = null;
        var status = 0;
        var response = {
            error: {},
            message: {}
        };
        if(data.hasOwnProperty("context"))
        {
            transaction_id = data.context.transaction_id;
            message_id = data.context.message_id;
            status = 200;
            response.message = {
                ack: {
                    status: "ACK"
                }
            }
            socket.emit('on_init',req.body);
        }
        else
        {
            status = 500;
            response.error = {
                type: 404,
                code: "Invalid Request",
                path: "/on_init",
                message: "Context body missing"
            };
        }
        if(transaction_id!=null)
        {
            addLogs.addLogs({
                url: '/on_init',
                body: JSON.stringify(data),
                response: JSON.stringify(response),
                response_datetime: new Date(),
                transaction_id: transaction_id,
                message_id: message_id,
            });
        }
        else
        {
            addLogs.addLogs({
                url: '/on_init',
                body: JSON.stringify(data),
                response: JSON.stringify(response),
                response_datetime: new Date(),
            });
        }
        
        res.status(status).json(response);
    } catch (err) {
        log.info(err);
        res.status(500).json({
            error: {
                "type": err.type,
                "code": err.code,
                "path": "/on_init",
                "message": err.msg
            },
            message: {}
        });
    }
}

exports.on_select = async function (req, res) {
    try {
        var data = req.body;
        var transaction_id = null;
        var message_id = null;
        var status = 0;
        var response = {
            error: {},
            message: {}
        };
        if(data.hasOwnProperty("context"))
        {
            transaction_id = data.context.transaction_id;
            message_id = data.context.message_id;
            status = 200;
            response.message = {
                ack: {
                    status: "ACK"
                }
            }
            socket.emit('on_select',req.body);
        }
        else
        {
            status = 500;
            response.error = {
                type: 404,
                code: "Invalid Request",
                path: "/on_select",
                message: "Context body missing"
            };
        }
        if(transaction_id!=null)
        {
            addLogs.addLogs({
                url: '/on_select',
                body: JSON.stringify(data),
                response: JSON.stringify(response),
                response_datetime: new Date(),
                transaction_id: transaction_id,
                message_id: message_id,
            });
        }
        else
        {
            addLogs.addLogs({
                url: '/on_select',
                body: JSON.stringify(data),
                response: JSON.stringify(response),
                response_datetime: new Date(),
            });
        }
        
        res.status(status).json(response);
    } catch (err) {
        log.info(err);
        res.status(500).json({
            error: {
                "type": err.type,
                "code": err.code,
                "path": "/on_select",
                "message": err.msg
            },
            message: {}
        });
    }
}

exports.on_status = async function (req, res) {
    try {
        var data = req.body;
        var transaction_id = null;
        var message_id = null;
        var status = 0;
        var response = {
            error: {},
            message: {}
        };
        if(data.hasOwnProperty("context"))
        {
            transaction_id = data.context.transaction_id;
            message_id = data.context.message_id;
            status = 200;
            response.message = {
                ack: {
                    status: "ACK"
                }
            }
            socket.emit('on_status',req.body);
        }
        else
        {
            status = 500;
            response.error = {
                type: 404,
                code: "Invalid Request",
                path: "/on_status",
                message: "Context body missing"
            };
        }
        if(transaction_id!=null)
        {
            addLogs.addLogs({
                url: '/on_status',
                body: JSON.stringify(data),
                response: JSON.stringify(response),
                response_datetime: new Date(),
                transaction_id: transaction_id,
                message_id: message_id,
            });
        }
        else
        {
            addLogs.addLogs({
                url: '/on_status',
                body: JSON.stringify(data),
                response: JSON.stringify(response),
                response_datetime: new Date(),
            });
        }
        
        res.status(status).json(response);
    } catch (err) {
        log.info(err);
        res.status(500).json({
            error: {
                "type": err.type,
                "code": err.code,
                "path": "/on_status",
                "message": err.msg
            },
            message: {}
        });
    }
}

exports.get_onSearchData = async function (req, res) {
    try {
        query = `SELECT * FROM logs
        WHERE
        transaction_id='${req.body.transaction_id}'
        AND
        url='/on_search'
        AND
        is_deleted=0
        ORDER BY id DESC`;
        
        pool.query(query, async function (error, results) {
            if (results) {
                if (results.length>0) {
                    res.status(200).json({
                        success: true,
                        data: results
                    })
                }
                else {
                    res.status(500).json({
                        success: false,
                        msg: "UUID Not Found"
                    })
                }
            }
            else if(error) {
                res.status(500).json({
                    success: false,
                    error
                })
            }
        })
    } catch (err) {
        log.info(err);
        res.status(500).json({
            error: {
                "type": err.type,
                "code": err.code,
                "path": "/get_onSearchData",
                "message": err.msg
            }
        });
    }
}

exports.select = async function (req, res) {
    try {
        var data = req.body;
        const messageId = uuidv4();
        params = {
            "context": {
                "domain": "nic2004:85110",
                "country": "IND",
                "city": "std:080",
                "action": "select",
                "core_version": "0.7.1",
                "transaction_id": data.transaction_id,
                "message_id": messageId,
                "timestamp": new Date(),
                "consumer_id": `${process.env.CONSUMER_ID}`,
                "consumer_uri": `${process.env.CALLBACK_URL}`
            },
            "message": {
                "order": {
                    "provider": {
                        "id": data.provider_id
                    },
                    "items": [
                        {
                            "id": data.item_id,
                            "fulfillment_id": data.fulfillment_id
                        }
                    ]
                }
            }
        }
        
        request.post({
            url:`${data.details.context.provider_uri}/select`,
            body: params,
            json: true
        }, function(err, response, body){
            var response = {
                success: true,
                body
            };
            addLogs.addLogs({
                url: '/select',
                body: JSON.stringify(params),
                response: JSON.stringify(response),
                response_datetime: new Date(),
                transaction_id: data.transaction_id
            });
            res.status(200).json(response)
        });
    } catch (err) {
        log.info(err);
        res.status(500).json({
            error: {
                "type": err.type,
                "code": err.code,
                "path": "/select",
                "message": err.msg
            }
        });
    }
}

exports.get_onSelectData = async function (req, res) {
    try {
        query = `SELECT * FROM logs
        WHERE
        transaction_id='${req.body.transaction_id}'
        AND
        url='/on_select'
        AND
        is_deleted=0
        ORDER BY id DESC
        LIMIT 1`;
        
        pool.query(query, async function (error, results) {
            if (results) {
                if (results.length>0) {
                    res.status(200).json({
                        success: true,
                        data: results
                    })
                }
                else {
                    res.status(500).json({
                        success: false,
                        msg: "UUID Not Found"
                    })
                }
            }
            else if(error) {
                res.status(500).json({
                    success: false,
                    error
                })
            }
        })
    } catch (err) {
        log.info(err);
        res.status(500).json({
            error: {
                "type": err.type,
                "code": err.code,
                "path": "/get_onSearchData",
                "message": err.msg
            }
        });
    }
}

exports.init = async function (req, res) {
    try {
        var date = new Date();
        // 2022-06-22T15:41:3
        date = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2)+"T";
        var data = req.body;
        const messageId = uuidv4();
        const orderId = uuidv4();
        
        var params = {
            "context": {
                "domain": "nic2004:85111",
                "country": "IND",
                "city": data.details.context.city,
                "action": "init",
                "timestamp": new Date(),
                "core_version": "0.7.1",
                "consumer_id": `${process.env.CONSUMER_ID}`,
                "consumer_uri": `${process.env.CALLBACK_URL}`,
                "transaction_id": data.details.context.transaction_id,
                "message_id": messageId
            },
            "message": {
                "order": {
                    "id": orderId,
                    "item": data.details.items,
                    "billing": {
                        "name": "Shubham Bhadale",
                        "address": {
                            "door": "406",
                            "name": "Plus91 Techbologies Pvt Ltd",
                            "locality": "Vimannagar",
                            "city": "Pune",
                            "state": "Maharashtra",
                            "country": "India",
                            "area_code": "411013"
                        },
                        "email": "shubham.bhadale@plus91.in",
                        "phone": "11111111111"
                    },
                    "fulfillment": {
                        "id": data.details.id,
                        "type": data.details.type,
                        "agent": data.details.agent,
                        "start": {
                            "time": {
                                "timestamp": date+data.slot_start_time  
                            }
                        },
                        "end": {
                            "time": {
                                "timestamp": date+data.slot_end_time
                            }
                        },
                        "tags": data.details.tags
                    },
                    "customer": {
                        "id": "61-7719-8914-2522",
                        "cred": "shubham.bhadale@abdm"
                    }
                }
            }
        }
        
        request.post({
            url:`${data.details.context.provider_uri}/init`,
            body: params,
            json: true
        }, function(err, response, body){
            var response = {
                success: true,
                body
            };
            addLogs.addLogs({
                url: '/init',
                body: JSON.stringify(params),
                response: JSON.stringify(response),
                response_datetime: new Date(),
                transaction_id: data.transaction_id
            });
            res.status(200).json(response);
        });
    } catch (err) {
        log.info(err);
        res.status(500).json({
            error: {
                "type": err.type,
                "code": err.code,
                "path": "/init",
                "message": err.msg
            }
        });
    }
}

exports.get_onInitData = async function (req, res) {
    try {
        query = `SELECT * FROM logs
        WHERE
        transaction_id='${req.body.transaction_id}'
        AND
        url='/on_init'
        AND
        is_deleted=0
        ORDER BY id DESC
        LIMIT 1`;
        
        pool.query(query, async function (error, results) {
            if (results) {
                if (results.length>0) {
                    res.status(200).json({
                        success: true,
                        data: results
                    })
                }
                else {
                    res.status(500).json({
                        success: false,
                        msg: "UUID Not Found"
                    })
                }
            }
            else if(error) {
                res.status(500).json({
                    success: false,
                    error
                })
            }
        })
    } catch (err) {
        log.info(err);
        res.status(500).json({
            error: {
                "type": err.type,
                "code": err.code,
                "path": "/get_onInitData",
                "message": err.msg
            }
        });
    }
}

exports.confirm = async function (req, res) {
    try {
        var data = req.body;
        const messageId = uuidv4();
        console.log(data.details);
        params = {
            "context": {
                "domain": "nic2004:85111",
                "country": "IND",
                "city": data.details.context.city,
                "action": "confirm",
                "timestamp": new Date(),
                "core_version": "0.7.1",
                "consumer_id": `${process.env.CONSUMER_ID}`,
                "consumer_uri": `${process.env.CALLBACK_URL}`,
                "transaction_id": data.details.context.transaction_id,
                "message_id": messageId
            },
            "message": {
                "order": {
                    "id": data.details.id,
                    "item": data.details.item,
                    "billing": data.details.billing,
                    "fulfillment": data.details.fulfillment,
                    "quote": data.details.quote,
                    "payment": {
                        "uri": data.details.payment.uri,
                        "params": data.details.payment.params,
                        "type": data.details.payment.type,
                        "status": "PAID",
                        "tl_method": data.details.payment.tl_method
                    },
                    "customer": data.details.customer
                }
            }
        }
        
        request.post({
            url:`${data.details.context.provider_uri}/confirm`,
            body: params,
            json: true
        }, function(err, response, body){
            var response = {
                success: true,
                body
            };
            addLogs.addLogs({
                url: '/confirm',
                body: JSON.stringify(params),
                response: JSON.stringify(response),
                response_datetime: new Date(),
                transaction_id: data.details.context.transaction_id
            });
            res.status(200).json(response)
        });
    } catch (err) {
        log.info(err);
        res.status(500).json({
            error: {
                "type": err.type,
                "code": err.code,
                "path": "/confirm",
                "message": err.msg
            }
        });
    }
}

exports.get_onConfirmData = async function (req, res) {
    try {
        query = `SELECT * FROM logs
        WHERE
        transaction_id='${req.body.transaction_id}'
        AND
        url='/on_confirm'
        AND
        is_deleted=0
        ORDER BY id DESC
        LIMIT 1`;
        
        pool.query(query, async function (error, results) {
            if (results) {
                if (results.length>0) {
                    res.status(200).json({
                        success: true,
                        data: results
                    })
                }
                else {
                    res.status(500).json({
                        success: false,
                        msg: "UUID Not Found"
                    })
                }
            }
            else if(error) {
                res.status(500).json({
                    success: false,
                    error
                })
            }
        })
    } catch (err) {
        log.info(err);
        res.status(500).json({
            error: {
                "type": err.type,
                "code": err.code,
                "path": "/get_onConfirmData",
                "message": err.msg
            }
        });
    }
}