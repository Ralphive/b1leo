/** App Initial Configuration **/

/* Load NodeJS Modules */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const redis = require("redis")
const pg = require("pg")

/* Load Local Modules */
const b1 = require('./modules/erp/b1');
const byd = require('./modules/erp/byd');
const biz = require('./modules/biz');
const sql = require('./modules/sql');
const start = require('./modules/start')

/* Configure Redis */
console.log("Configuring redis")
var credentials = null;
var vcap = null;
if (process.env.VCAP_SERVICES) {
    credentials = {}
    vcap = JSON.parse(process.env.VCAP_SERVICES);
    credentials = vcap['redis'][0].credentials;
    credentials.host = credentials.hostname
    console.log("Redis credentials found in VCAP")
};
var redisClient = redis.createClient(credentials);
redisClient.on('connect', function () {
    console.log("Connected to Redis")
    b1.setClient(redisClient)
    byd.setClient(redisClient)
});

/* Configure PostgreSQL */
credentials = null;
if (vcap) {
    credentials = { connectionString: vcap_services.postgresql[0].credentials.uri }
    console.log("Postgree credentials found in VCAP")
};
var pgClient = new pg.Client(credentials)
pgClient.connect(function (err) {
    if (err) {
        console.error("Error Connecting to PostgreSQL - \n" + err)
    } else {
        console.log('PostegreSQL connected')
        sql.setClient(pgClient);
    }
})

/* Configure Express App */
console.log("Configuring Express App")
const app = express();
app.use(express.static('public'));
console.log("Allowing CORS...")
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
//To Support body on post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



/* Express API */
// Root path to retrieve Index.html
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/Items', function (req, res) {
    console.log("REQUEST: List Items")
    biz.GetItems(req.query, function (error, response) {
        res.setHeader('Content-Type', 'application/json')
        res.status(200)
        res.send(response)
    })
});

app.get('/SalesOrders', function (req, res) {
    console.log("REQUEST: List Sales Orders")
    biz.GetSalesOrders(req.query, function (error, response) {
        res.setHeader('Content-Type', 'application/json')
        res.status(200)
        res.send(response)
    })
});

app.post('/Initialize', function (req, res) {
    console.log("POST REQUEST: Initialize System")
    start.Initialize();
    var output = {
        message: "executing"
    };
    res.setHeader('Content-Type', 'application/json')
});

app.post('/SimilarItems', function (req, res) {

    biz.SimilarItems(req.body, function (err, resp) {
        if (err) {
            res.status(500).send(resp)
        } else {
            console.dir(resp);
            res.status(200).send(resp)
        }
    });
    console.log('GetSimilarItems')
});


var port = process.env.PORT || 30000
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

