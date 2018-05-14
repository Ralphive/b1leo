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

    sql.Initialize(function (error) {
        if (!error) {
            for (key in erps) {
                loadErpItems(erps[key], null, function (origin) {
                    console.log(origin + " Items Loaded")
                    RetrieveImages(origin, function (text) {
                        console.log("DB Vectorized")
                    })
                });
            }
        } else {
            console.error("Can't Create table for app initialization");
        }
    })
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
    var chosen = []
    for (property in data) {
        var values = data[property].values
        for (var i = 0; i < values.length; i++) {
            if (!values[i].image || values[i].image == "" || path.extname(values[i].image) == "") {
                continue
            } else {
                values[i].origin = property;
                chosen.push(values[i])
            }
            console.log("To insert Item " + values[i].productid + " from " + property + " on database.")
            sql.Insert(values[i])
        }
    }
}

function RetrieveImages(origin, callback) {
    sql.SelectErpItems(origin, function (err, rows) {
        if (err) {
            console.log("Can't select items to retrieve images from " + origin)
            callback(err)
        } {
            console.log(rows.length + " items found to retrieve images from " + origin)
            for (i in rows) {
                biz.DownloadImage(rows[i].image, biz.RowToFile(rows[i]), function (imgPath) {
                    console.log(imgPath + " Downloaded!")
                    leo.extractVectors(imgPath, function (error, vector) {
                        if (!error) {
                            console.log("Received Vector for " + vector.predictions[0].name)
                            var rowToUpdate = biz.FileToRow(vector.predictions[0].name)
                            rowToUpdate.imgvector = vector.predictions[0].feature_vector
                            sql.UpdateVector(rowToUpdate, function (err, result) {
                                console.log("Table Updated")
                            })
                        }
                    })
                })
            }
        }
    })
}