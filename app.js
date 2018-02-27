/* Load NodeJS Modules */
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();
app.use(express.static('public'));


//To Support body on post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root path to retrieve Index.html
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/index.html'));
  });

var port = process.env.PORT || 30000
app.listen(port, function () {
  console.log('Example app listening on port ' + port);
});