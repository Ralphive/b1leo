/** This module initialize the entire system 
 * retrieving item information from the ERPs, storing it in the app DB
 * and also extracting the Image Feature (Vector) of each item with SAP Leonardo**/

module.exports = {
    Initialize: function () {
        return (Initialize())
    }
}

const qs = require("qs")
const fs = require("fs")
const path = require("path")
const request = require("request")

const sql = require("./sql")
const leo = require("./leo")
const biz = require("./biz")
const b1 = require("./erp/b1")
const byd = require("./erp/byd")
const normalize = require("./normalize")


function Initialize() {
    var erps = ['b1', 'byd']

    for (key in erps) {
        loadErpItems(erps[key], null, function (origin) {
            console.log(origin + " Items Loaded")
            RetrieveImages(origin, function (text) {
                console.log("DB Vectorized")
            })
        });
    }
}

function loadErpItems(origin, query, callback) {
    //Load ERP Items and insert them in the app DB
    if (query) {
        query = qs.parse(query);
    }

    erp = eval(origin);

    erp.GetItems(query, function (error, items) {
        if (error) {
            items = {};
            items.error = error;
        }
        var output = {};
        output[origin] = { values: items.error || items.value }


        //Update DB
        InsertItemVectorDB(normalize.Items(output))

        if (items.hasOwnProperty("odata.nextLink")) {
            output[origin]["odata.nextLink"] = items["odata.nextLink"];
            loadErpItems(origin, output[origin]["odata.nextLink"], callback);
        } else {
            callback(origin)
        }
    })
}

function InsertItemVectorDB(data) {
    for (property in data) {
        var values = data[property].values
        for (var i = 0; i < values.length; i++) {
            if (!values[i].image || values[i].image == "") { continue }

            values[i].origin = property;
            sql.Insert(values[i])
        }
    }
}

function RetrieveImages(origin, callback) {
    sql.SelectErpItems(origin, function (err, result) {
        if (err) {
            console.log("Can't select items to retrieve images from " + origin)
            callback(err)
        } {
            console.log(result.length + " items found to retrieve images from " + origin)
            DownloadItemImages(result)
        }
    })
}

function DownloadItemImages(rows) {
    for (i in rows) {
        DownloadImage(rows[i].image, biz.FormatFileName(rows[i]), function () {
            console.log('file downloaded');
        })
    }
}

function DownloadImage(uri, filename, callback) {
    console.log("Downloading image from " + uri)
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(path.join(process.env.TEMP_DIR, filename))).on('close', callback);
    });
}