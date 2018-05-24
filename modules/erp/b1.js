/* Service Layer module to interact with B1 Data */
/* Server Configuration and User Credentials set in environment variables */
/* Session and Node ID stored in Redis cache database */

var client; // Redis Client

module.exports = {
    GetItems: function (options, callback) {
        return (GetItems(options, callback))
    },
    GetOrders: function (options, callback) {
        return (GetOrders(options, callback))
    },
    PostSalesOrder: function (body, callback) {
        return (PostSalesOrder(body, callback))
    },
    setClient: function (inClient) { client = inClient; }
}
const request = require('request')  // HTTP Client
const moment = require('moment')    // Date Time manipulation


const odata = require("../odata")


//Hash Keys for Redis DB
const hash_Session = "b1_SessionID"
const hash_Timeout = "b1_Timeout"
const timout_exp = "b1_Expire"


//Load Environment Variables
const SLServer = process.env.B1_SERVER_ENV + ":" + process.env.B1_SLPORT_ENV + process.env.B1_SLPATH_ENV;

function ServiceLayerRequest(options, callback) {

    console.log("Preparing Service Layer Request:" +JSON.stringify(options.method) +" - "+JSON.stringify(options.url))

    getCookiesCache().then(function (cookies) {
        options.headers = { 'Cookie': cookies };

        request(options, function (error, response, body) {
            if (error) {
                console.error(error.message)
            } else {
                if (response.statusCode == 401) {
                    //Invalid Session
                    Connect().then(function () {
                        ServiceLayerRequest(options, callback)
                    }).catch(function (error, response) {
                        callback(error, response)
                    })
                    console.log("Request response with status: " + response.statusCode +
                        "\nRequest headers: " + JSON.stringify(response.headers))
                }
            }
            callback(error, response, body);
        });
    })
        .catch(function () {
            Connect().then(function () {
                ServiceLayerRequest(options, callback)
            }).catch(function (error, response) {
                callback(error, response)
            })
        })
}

function GetItems(query, callback) {
    var options = {}
    var select = "ItemCode,ItemName,ItemPrices,SalesUnit,QuantityOnStock,User_Text,Picture"
    options.url = SLServer + "/Items"
    options.method = "GET"
    
    
    if(query && query.hasOwnProperty("$filter")){
         //To be replaced by Normalize.ItemQuery()
        query["$filter"] = b1Normalize(query["$filter"])
    }
    
    
    options.qs = odata.formatQuery(query,select)

    ServiceLayerRequest(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = odata.formatResponse(JSON.parse(body));
            callback(null, body);
        } else {
            callback(error);
        }
    });
}

function GetOrders(query, callback) {
    var options = {}
    var select = ""

    options.url = SLServer + "/Orders"
    options.method = "GET"
    options.qs = odata.formatQuery(query,select)

    ServiceLayerRequest(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = odata.formatResponse(JSON.parse(body));
            callback(null, body);
        } else {
            callback(error);
        }
    });
}

function PostSalesOrder(body, callback) {
    var options = {}

    options.url = SLServer + "/Orders"
    options.method = "POST"
    options.body = {
        "CardCode" : process.env.B1_DEFAULT_BP,
        "DocDueDate" : moment().format('YYYY-MM-DD'),
        "Comments": "Order created via SMB Mkt Place @" + moment.now(),
        "DocumentLines":[]
    }
    options.body.DocumentLines = JSON.parse(b1Normalize(JSON.stringify(body.lines)))

    options.body = JSON.stringify(options.body);

    ServiceLayerRequest(options, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            console.log("Sales order created: "+ body.DocEntry)
            body = odata.formatResponse(JSON.parse(body));
            callback(null, body);

        } else {
            callback(error);
        }
    });
}

let Connect = function () {
    return new Promise(function (resolve, reject) {
        var uri = SLServer + "/Login"
        var resp = {}

        //B1 Login Credentials
        var data = {
            UserName: process.env.B1_USER_ENV,
            Password: process.env.B1_PASS_ENV,
            CompanyDB: process.env.B1_COMP_ENV
        };

        //Set HTTP Request Options
        options = { uri: uri, body: JSON.stringify(data), timeout: 10000 }
        console.log("Connecting to SL on " + uri);

        //Make Request
        request.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("Connected to SL Succeeded!")
                body = JSON.parse(body)
                setCookiesCache(response.headers['set-cookie'], function () {
                    setSLSessionTimeout(body.SessionTimeout)
                    resolve();
                });

            } else {
                console.error("Connection to Service Layer failed. \n" + error)
                reject(error, response);
            }
        });

    })

}

let getCookiesCache = function () {
    return new Promise(function (resolve, reject) {

        client.hget(hash_Timeout, timout_exp, function (error, expire) {
            if (moment().isAfter(expire)) {
                //SessionID cached is expired or Doesn't Exist
                console.log("Cached SL Session ID Expired")
                reject()
            } else {
                client.lrange(hash_Session, 0, -1, function (err, cookies) {
                    if (cookies.length > 0) {
                        console.log("Cached SL Session Retrieved")
                        resolve(cookies)
                    } else {
                        console.log("Cached SL not found")
                        reject();
                    }
                });
            }
        })
    })
}

function setCookiesCache(cookies, callback) {
    // Dump Previous SL Session ID Cache and creates a new one
    client.del(hash_Session, function () {
        client.rpush(hash_Session, cookies, function () {
            console.log("Storing SL Session ID in cache")
            callback();
        });
    })
}

function setSLSessionTimeout(timeout) {
    //Store the Session Timeout
    client.hset(hash_Timeout, hash_Timeout, timeout)

    //Calculates and store when session will be expired
    var expire = moment(moment.now()).add(timeout, 'minutes')
    client.hset(hash_Timeout, timout_exp, expire.format())

}

function updateSLSessionTimeout() {
    //Calculates and store when session will be expired
    console.log("Updating SL Session Expiration date in cache")
    client.hget(hash_Timeout, hash_Timeout, function (error, reply) {
        if (error) {
            console.error("Can't Update Session Timeout in Redis " + error)
        } else {
            var expire = moment(moment.now()).add(reply, 'minutes')
            client.hset(hash_Timeout, timout_exp, expire.format())
        }
    })
}

function b1Normalize(str){
    // To be replaced by Normalize.js Functions in the future
    str = str.replace(new RegExp('productid', 'g'), "ItemCode")
    str = str.replace('lines', "DocumentLines")
    return str
}