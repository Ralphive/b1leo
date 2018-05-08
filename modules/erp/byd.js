/* Module to manipulate ByD data */

module.exports = {
    GetItems: function (options, callback) {
        return (GetItems(options, callback))
    },
    GetSalesOrders: function (options, callback) {
        return (GetSalesOrders(options, callback))
    },
}

const request = require('request')  // HTTP Client
const redis = require('redis')      // Cache db
const moment = require('moment')    // Date Time manipulation

//Set Redis (cache DB) client
let client = redis.createClient();
client.on('connect', function () {
    console.log("Connected to Redis...")
});

//Hash Keys for Redis DB
const hash_Session = "byd_SessionID"
const hash_csrf = "byd_CSRF"

//ByD Models
const model_sales = "/khsalesorderdemo/SalesOrderCollection?$format=json"
const model_items = "/byd_items/MaterialCollection?$format=json"

//Load Environment Variables
const ByDServer = process.env.BYD_SERVER + ":" + process.env.BYD_PORT + process.env.BYD_PATH;
const ByDHeader = {
    uri: ByDServer,
    method: "GET",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Basic " + process.env.BYD_AUTH,
        "x-csrf-token": "fetch",
        "Cookie": ""
    }
};


function ByDRequest(options, callback) {

    console.log("Preparing BYD Request:" + JSON.stringify(options))

    getCookiesCache().then(function (cookies, csrfToken) {

        options.headers["Cookie"] = cookies
        options.headers["x-csrf-token"] = csrfToken

        request(options, function (error, response, body) {
            if (error) {
                console.error(error.message)
            } else {
                if (response.statusCode == 403) {
                    //Invalid Token
                    
                    Connect().then(function () {
                        ByDRequest(options, callback)
                    }).catch(function (error, response) {
                        callback(error, response)
                    })
                }
                console.log("Request response with status: " + response.statusCode +
                    "\nRequest headers: " + JSON.stringify(response.headers))
            }
            callback(error, response, JSON.parse(body));
        });
    })
        .catch(function () {
            if (options.method == "GET") {
                //GET Doesn't require token
                request(options, function (error, response, body) {
                    if (error) {
                        console.error(error.message)
                    } else {
                        console.log("Request response with status: " + response.statusCode +
                            "\nRequest headers: " + JSON.stringify(response.headers))
                            
                            setCookiesCache(response.headers['set-cookie'], function () {
                                setByDToken(response.headers["x-csrf-token"])
                            });
                    }
                    callback(error, response, JSON.parse(body));
                })
            } else {
                Connect().then(function () {
                    ByDRequest(options, callback)
                }).catch(function (error, response) {
                    callback(error, response)
                })
            }
        })
}

function GetItems(options, callback) {

    var reqopt = ByDHeader;
    reqopt.uri = ByDServer + model_items
    reqopt.uri += "&$select=InternalID,Description,BaseMeasureUnitCode"


    if (options.hasOwnProperty('skip')) {
        reqopt.uri += "&" + options.skip
    }

    ByDRequest(reqopt, function (error, response, body) {
        if (error){
            callback(error);
        }else{
            callback(null, body);
        }
    });
}

function GetSalesOrders(options, callback) {

    var reqopt = ByDHeader;
    reqopt.uri = ByDServer + model_sales
    //reqopt.uri += "&$select=InternalID,Description,BaseMeasureUnitCode"


    if (options.hasOwnProperty('skip')) {
        reqopt.uri += "&$skip=" + options.skip
    }

    ByDRequest(reqopt, function (error, response, body) {
        if (error){
            callback(error);
        }else{
            callback(null, body);
        }
    });
}

let Connect = function () {

    /* There is no "login" endpoint in ByD. Instead the Base64 credentials should be passed in
     * the header of a GET Request. From the response of this request, we retrieve a CSRF token
     * that is required for any other method (POST/PATCH/DELETE etc...). Session Cookies are also 
     * required and in this app all of them are stored in cache.
     **/

    return new Promise(function (resolve, reject) {

        var options = ByDHeader;
        options.uri = ByDServer + model_sales

        console.log("Reaching ByD on " +  options.uri);

        //Make Request
        request.get(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("BYD Reached successfully!")
                setCookiesCache(response.headers['set-cookie'], function () {
                    setByDToken(response.headers["x-csrf-token"])
                    resolve();
                });
            } else {
                console.error("Error reaching ByD. \n" + response.statusCode + " - " + error)
                reject(error, response);
            }
        });
    })

}

let getCookiesCache = function () {
    return new Promise(function (resolve, reject) {
        client.hget(hash_csrf, hash_csrf, function (error, csrfToken) {
            if (!csrfToken) {
                //No Token in cache
                console.log("No ByD CSRF Token in cache")
                reject()
            } else {
                client.lrange(hash_Session, 0, -1, function (err, cookies) {
                    if (cookies.length > 0) {
                        console.log("Cached ByD cookies Retrieved")
                        resolve(cookies, csrfToken)
                    } else {
                        console.log("Cached ByD cookies not found")
                        reject();
                    }
                });
            }
        })
    })
}

function setCookiesCache(cookies, callback) {
    // Dump Previous Cookies Cache and creates a new one
    client.del(hash_Session, function () {
        client.rpush(hash_Session, cookies, function () {
            console.log("Storing ByD Cookies in cache")
            callback();
        });
    })
}

function setByDToken(csrfToken) {
    //Store the Session Timeout
    client.hset(hash_csrf, hash_csrf, csrfToken)
    console.log("Storing ByD CSRF token in cache")
}