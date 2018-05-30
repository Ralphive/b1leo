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
const isImage = require("is-image")
const archiver = require("archiver")
const uuid = require("uuid")

const sql = require("./sql")
const leo = require("./leo")
const biz = require("./biz")
const b1 = require("./erp/b1")
const byd = require("./erp/byd")
const normalize = require("./normalize")


function Initialize() {
    var erps = ['byd', 'b1']

    sql.Initialize(function (error) {
        if (!error) {
            var call = 0
            for (key in erps) {
                loadErpItems(erps[key], null, function (origin) {
                    call++;
                    console.log(origin + " Items Loaded")
                    if (call == erps.length) {
                        console.log("Starting processing of Images")
                        RetrieveImages(function (text) {
                            console.log("DB Vectorized")
                        })
                    }
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

    console.log("Getting data from " + origin)

    erp = eval(origin);

    erp.GetItems(query, function (error, items) {
        var output = {} 
        if (error) {
            output[origin] = { values: error }
            callback(origin)
        } else {
            output[origin] = { values: items.error || items.value }


            //Update DB
            InsertItemVectorDB(normalize.Items(output))

            if (items.hasOwnProperty("odata.nextLink")) {
                output[origin]["odata.nextLink"] = items["odata.nextLink"];
                loadErpItems(origin, output[origin]["odata.nextLink"], callback);
            } else {
                callback(origin)
            }
        }
    })
}

function InsertItemVectorDB(data) {
    var chosen = []
    for (property in data) {
        var values = data[property].values
        for (var i = 0; i < values.length; i++) {
            if (!values[i].image || !isImage(values[i].image)) {
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

function RetrieveImages(callback) {
    sql.Select(function (err, rows) {
        if (err) {
            console.error("Can't select items to retrieve images from " + origin)
        } {
            DowloadAllImages(rows)
                .then(CreateFeatureExtractionZip)
                .then(function (zipFile) {
                    leo.extractVectors(zipFile, function (error, vectors) {
                        if (!error) {
                            for (vector in vectors.predictions) {
                                console.log("Received Vector for vector #" + vector + " - " + vectors.predictions[vector].name)
                                var rowToUpdate = biz.FileToRow(vectors.predictions[vector].name)
                                rowToUpdate.imgvector = vectors.predictions[vector].feature_vector
                                sql.UpdateVector(rowToUpdate, function (err, result) {
                                    console.log("Table Updated")
                                })
                                if (vector == vectors.predictions.length - 1) {
                                    biz.CleanDirectory(process.env.TEMP_DIR)
                                    biz.CleanDirectory(process.env.VECTOR_DIR)
                                }
                            }
                        } else {
                            console.error(error);
                        }
                        biz.UpdateItemPrices()
                    })
                })
        }
    })
}

let DowloadAllImages = function (rows) {
    return new Promise(function (resolve, reject) {
        var downloaded = 0;;
        for (i in rows) {
            biz.DownloadImage(rows[i].image, biz.RowToFile(rows[i]), function (imgPath) {
                downloaded++
                if (downloaded == rows.length) {
                    console.log("All images downloaded!")
                    resolve();
                }
            })
        }
    })
}


let CreateFeatureExtractionZip = function () {
    return new Promise(function (resolve, reject) {

        // Create e zip file of vectors to be used by the Similarity scoring service 
        var zipFile = path.join(process.env.TEMP_DIR, uuid.v4() + '.zip');

        // create a file to stream archive data to the zip
        var output = fs.createWriteStream(zipFile);
        var archive = archiver('zip', { zlib: { level: 9 } }); // Sets the compression level. 

        // listen for all archive data to be written 
        output.on('close', function () {
            console.log("Extraction Feature Zip Created - " + zipFile)
            console.log("Time to call Leonardo")
            resolve(zipFile)
        });

        // good practice to catch warnings (ie stat failures and other non-blocking errors) 
        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                // log warning 
            } else {
                // throw error 
                reject(err)
            }
        });

        // good practice to catch this error explicitly 
        archive.on('error', function (err) {
            reject(err)
        });

        // pipe archive data to the file 
        archive.pipe(output);

        fs.readdirSync(process.env.TEMP_DIR).forEach(file => {
            if (isImage(file)) {
                archive.append(fs.createReadStream(path.join(process.env.TEMP_DIR, file)), { name: file });
                console.log(file + "Added to Extraction Feature Zip");
            }
        })

        // finalize the archive (ie we are done appending files but streams have to finish yet) 
        archive.finalize();
    })
}
