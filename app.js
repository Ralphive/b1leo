/* Load NodeJS Modules */
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();
app.use(express.static('public'));

/* Load Local Modules */
var sl = require('./modules/serviceLayer');
var leo = require('./modules/leo');

var slSession = null;
var output = {};


//First Thing, coonect to SL and store a SessionID
sl.Connect(function (error, resp) {
    if (error) {
        console.error("Can't Connect to Service Layer");
        console.error(error);
        return; // Abort Execution
    } else {
        slSession = resp;
    }
});

//To Support body on post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root path to retrieve Index.html
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

//EndPoint To retrieve Items from Service Layer
app.get('/Items', function (req, res) {
    console.log("REQUEST: Retrive Service Layer Items");
    var options = { headers: { 'Cookie': slSession.cookie } };
    sl.GetItems(options, function (error, resp, body) {
        if (error) {
            body = { error: error };
        }
        res.setHeader('Content-Type', 'application/json')
        res.status(resp.statusCode)
        res.send(body)
    });
});

/** Receives a Text Message
 * Classify it with SAP Leonardo Business Services
 * Ticket Intelligence Classification API
 * Then Creates an Activity in SAP Business One with the Result
 */
app.post('/Message', function (req, res) {
    console.log("REQUEST: Classify Text with Leo: " + req.body.text)

    leo.Classify(req.body.text, function (error, response, body) {
        if (error) {
            body = { error: error };
        }
        res.setHeader('Content-Type', 'application/json')
        res.status(response.statusCode)
        res.send(body)
    });
    console.error(e.message)
    res.setHeader('Content-Type', 'application/json')
    res.status(500)
    res.send({ error: e.message })
});

var port = process.env.PORT || 30000
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});