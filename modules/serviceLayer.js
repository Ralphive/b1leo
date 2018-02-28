/* Service Layer module to interact with B1 Data */
/* Server Configuration and User Credentials set in environment variables */
module.exports = {
    Connect: function (callback) {
        return (Connect(callback));
    },
    PostActivity: function (options, callback) {
        return (PostActivity(options, callback));
    },
    PostItems: function (options, body, callback) {
        return (PostItems(options, body, callback));
    }
}


//Load Local configuration file
var SLServer =   process.env.B1_SERVER_ENV+":"
                +process.env.B1_SLPORT_ENV 
                +process.env.B1_SLPATH_ENV;
//Load Node Modules
var req = require('request') // HTTP Client

function Connect(callback) {
    var uri = SLServer + "Login"
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
    req.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            body = JSON.parse(body);
            console.log(body)

            resp.cookie = response.headers['set-cookie']
            resp.SessionId = body.SessionId;

            return callback(null, resp);
        } else {
            return callback(response.statusMessage, response);
        }
    });

}

function PostActivity(options, callback) {

    //Set HTTP Request Options
    options.uri = SLServer + "Activities"
    
    options.body = JSON.stringify(options.body);
    //Make Request
    req.post(options, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            body = JSON.parse(body);
            delete body["odata.metadata"];
            return callback(null,response, body);
        } else {
            return callback(response.statusMessage, response, null );
        }
    });
}
function PostItems(options, body, callback) {

    var uri = SLServer + "Items"
    var resp = {}

    //Set HTTP Request Options
    options.uri = uri
    body.ItemsGroupCode = ItemGroupCode
    options.body = JSON.stringify(body);

    console.log("Posting Items to SL on " + uri);
    console.log("Item body: \n" + JSON.stringify(body));

    //Make Request
    req.post(options, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            body = JSON.parse(body);
            console.log("ITEM CREATED - " + JSON.stringify(body))
            return callback(null, body);
        } else {
            console.error("Can't Create SL ITEM" + error);
            return callback(error);
        }
    });
}
