/* Service Layer module to interact with B1 Data */
/* Server Configuration and User Credentials set in environment variables */
/* Session and Node ID stored in Redis cache database */

module.exports = {
    GetItems: function (options, callback) {
        return (GetItems(options, callback))
    }
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
const hash_Session = "SessionID"
const hash_Timeout = "Timeout"
const timout_exp = "Expire"


//Load Environment Variables
const SLServer = process.env.B1_SERVER_ENV + ":" + process.env.B1_SLPORT_ENV + process.env.B1_SLPATH_ENV;

function ServiceLayerRequest(options, callback) {

    console.log("Preparing Service Layer Request:" + JSON.stringify(options))

    getSLSessionCache().then(function (cookies) {
        options.headers = { 'Cookie': cookies };

        request(options, function (error, response, body) {
            console.log("Request response with status: " + response.statusCode +
                "\nRequest headers: " + JSON.stringify(response.headers))

            callback(error, response, body);
        });
    })
        .catch(function () {
            Connect().then(function () {
                ServiceLayerRequest(options, callback)
            })
        })
}

function GetItems(options, callback) {

    options.uri = SLServer + "/Items"
    options.method = "GET"

    if (options.hasOwnProperty('filter')) {
        options.uri += options.filter
    }

    ServiceLayerRequest(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.parse(body);
            delete body["odata.metadata"];
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
        options = { uri: uri, body: JSON.stringify(data) }
        console.log("Connecting to SL on " + uri);
        
        //Make Request
        request.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("Connected to SL Succeeded!")
                body = JSON.parse(body)
                setSLSessionCache(response.headers['set-cookie'], function () {
                    setSLSessionTimeout(body.SessionTimeout)
                    resolve();
                });

            } else {
                console.error("Connection to Service Layer failed. \n" + response.statusCode + " - " + error)
                reject(error, response);
            }
        });

    })

}

let getSLSessionCache = function () {
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

function setSLSessionCache(cookies, callback) {
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
