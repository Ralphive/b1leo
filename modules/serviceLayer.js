/* Service Layer module to interact with B1 Data */
/* Server Configuration and User Credentials set in environment variables */
/* Session and Node ID stored in Redis cache databse */
module.exports = {
    Connect: function (callback) {
        return (Connect(callback));
    },
    GetItems: function (options, callback) {
        return (GetItems(options, callback))
    }
}
const request = require('request') // HTTP Client
const redis = require('redis')



//Set Redis client

let client = redis.createClient();
client.on('connect', function () {
    console.log("Connected to Redis...")
});

const sidHash = "SessionID"
const sTimeout = "SessionID"



//Load Local configuration file
const SLServer = process.env.B1_SERVER_ENV + ":" + process.env.B1_SLPORT_ENV + process.env.B1_SLPATH_ENV;



function Connect(callback) {
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
            setSLSessionCache(response.headers['set-cookie']);
        } else {
            console.error("Connection to Service Layer failed. \n" + response.statusCode + " - " + error)
            return callback(response.statusMessage, response);
        }
    });
}


function GetItems(options, callback) {

    options.uri = SLServer + "/Items"

    getSLSessionCache().then(function(cookies) {
        options.headers = { 'Cookie': cookies } ;
        
        request.get(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                delete body["odata.metadata"];
                return callback(null, body);
            } else {
                return callback(error);
            }
        });
    })
}

function setSLSessionCache(cookies) {
    for (var i = 0; i < cookies.length; i++) {
        client.rpush(sidHash,cookies[i], redis.print);
    }
}

let getSLSessionCache = function () {
    return new Promise(function (resolve, reject) {
        client.lrange(sidHash,0, -1, function (err, cookies) {
            resolve(cookies)
        });
    })
}
