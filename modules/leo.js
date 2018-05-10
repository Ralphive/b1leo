module.exports = {
    extractVectors: function (file, callback) {
        return (extractVectors(file, callback))
    },

    SimilatiryScoring: function (vectors, numSimilars, callback) {
        return (SimilatiryScoring(vectors, numSimilars, callback))
    },

    Classify: function (text, callback) {
        return (Classify(text, callback));
    }
}

var request = require('request') // HTTP Client
var fs = require('fs')
var LeoServer = process.env.LEO_SERVER || "https://sandbox.api.sap.com/ml"

function extractVectors(file, callback) {
    // More info on
    // https://help.sap.com/viewer/product/SAP_LEONARDO_MACHINE_LEARNING_FOUNDATION/1.0/en-US


    var options = {
        url: 'https://sandbox.api.sap.com/ml/featureextraction/inference_sync',
        headers: {
            'APIKey': process.env.LEO_API_KEY,
            'Accept': 'application/json'
        },
        formData: {
            files: fs.createReadStream(file)
        }
    }

    request.post(options, function (err, res, body) {
        if (err || res.statusCode != 200) {
            console.error("LEO - Can't extract vector from " + file)
            if (err) {
                console.error(err)
            } else {
                console.error("Status Code - " + res.statusCode + " - " + res.statusMessage)
            }
            callback(err, null)
        }
        else {
            body = JSON.parse(body)
            console.log("Vector(s) extracted for " + body.predictions.length + " image(s)")
            callback(null, body);

        }
    });
}


function SimilatiryScoring(vectorsZip, numSimilars, callback) {

    numSimilars = numSimilars || 4
    var options = {
        url: 'https://sandbox.api.sap.com/ml/similarityscoring/inference_sync',
        headers: {
            'APIKey': process.env.LEO_API_KEY,
            'Accept': 'application/json',
        },
        formData: {
            files: fs.createReadStream(vectorsZip),
            options: '{"numSimilarVectors":' + numSimilars + '}'
        }
    }

    request.post(options, function (err, res, body) {
        if (err || res.statusCode != 200) {
            console.error("LEO - Can't run Similarity scoring for " + vectorsZip)
            if (!err) {
                err = "Status Code - " + res.statusCode + " - " + res.statusMessage
            }
            console.error(err)
            callback(err, null)
        }
        else {
            console.log("Vector(s) extracted for " + body.predictions.length + " image(s)")
            callback(null, body);

        }
    });
}



function Classify(text, callback) {
    var options = {
        "uri": LeoServer + "/sti/classification/text/classify",
        headers: {
            "APIKey": process.env.LEO_API_KEY,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    };

    options.body = JSON.stringify({
        "business_object": "ticket",
        "messages": [
            {
                "id": (Math.random() * 1000),
                "contents": [
                    {
                        "field": "text",
                        "value": text
                    }
                ]
            }
        ],
        "options": [
            {
                "classification_keyword": true
            }
        ]
    })

    //Make Request
    req.post(options, function (error, res, body) {
        body = JSON.parse(body);
        if (!error && res.statusCode == 200) {
            var classification = body.results[0].classification[0]
            console.log(
                "Text " + (classification.confidence * 100) + "% classified as a "
                + classification.value)
            return callback(null, res, classification);
        } else {
            console.error("Can't Analyse text due: " + body.status_message);
            console.error("Request Status Code: " + res.statusCode)
            return callback(body.status_message, res, null);
        }
    });
}
