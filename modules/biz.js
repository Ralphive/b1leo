/**
 * Biz Logic functions 
 * this module is a "Middleware" to talk with multiple backend systems
 * it also normalizes and combine the different data structures from B1 and ByD
 * so the output data has a standard b1 format.
 */

const request = require("request");
const fs = require("fs");
const path = require("path")
const uuid = require('uuid');
const archiver = require("archiver")
const redis = require("redis")

const sql = require("./sql")
const leo = require("./leo")
const normalize = require("./normalize")
const odata = require("./odata")


const b1 = require("./erp/b1")
const byd = require("./erp/byd")

var client; // Redis Client

module.exports = {
    GetItems: function (query, callback) {
        return (GetItems(query, callback))
    },
    GetSalesOrders: function (options, callback) {
        return (GetSalesOrders(options, callback))
    },
    SimilarItems: function (body, callback) {
        return (SimilarItems(body, callback))
    },

    DownloadImage: function (uri, filename, callback) {
        return DownloadImage(uri, filename, callback)
    },

    RowToFile: function (row) {
        return (RowToFile(row))
    },
    FileToRow: function (file) {
        return (FileToRow(file))
    },
    setClient: function (inClient) {
        client = inClient;
        b1.setClient(inClient)
        byd.setClient(inClient)
    }

}

function SimilarItems(body, callback) {

    var output = {}
    console.log("Dowloading image from: " + body.url)
    DownloadImage(body.url, uuid.v4() + path.extname(body.url), function (imgPath) {

        console.log("Extracting Vector for " + imgPath)
        leo.extractVectors(imgPath, function (error, vector) {
            if (error) {
                console.error(error)
                output.message = "Can't Extract vector for" + imgPath + " - " + error;
                return callback(error, output)
            }

            console.log("Loading Vector Database")
            sql.Select(function (error, result) {
                if (error) {
                    console.error(error)
                    output.message = "Can't retrive vector database " + error;
                    return callback(error, output)
                }

                console.log("Creating Zip with vector library")
                CreateSimilarityZip(result, vector, function (error, zipFile) {
                    if (error) {
                        console.error(error)
                        output.message = "Cant Create library ZIP" + error;
                        return callback(error, output)
                    }

                    var numSimilar = null;
                    if (body.hasOwnProperty("similarItems")) {
                        numSimilar = body.similarItems
                    }

                    console.log("Calling Leonardo Similarity Scoring")
                    leo.SimilatiryScoring(zipFile, numSimilar, function (error, similars) {
                        if (error) {
                            console.error(error)
                            output.message = "Cant retrieve SimilatiryScoring - " + error;
                            return callback(error, output)
                        }

                        console.log("Ranking Similarity Response")
                        MostSimilarItems(imgPath, similars, function (SimilarResponse) {

                            console.log("Formating Similarity Response and retrieve ERP Data")
                            formatSimilarResponse(SimilarResponse).then(function(finalData){
                                callback(null,finalData)
                            })
                        })
                    })
                })
            })
        })
    })
}

let formatSimilarResponse = function(response){
    return new Promise(function(resolve,reject){
        var fResp = {}
        var filter = {};
        var SimilarHash = uuid.v1();
    
        /* Test */ 
        response.push({origin: "byd", productid: "P100101", score: 0.02})
        response.push({origin: "byd", productid: "P100109", score: 0.02})
        response.push({origin: "byd", productid: "P100110", score: 0.02})
        /* Test */ 


        //Stores Item Similarity Score in Cache to be retrieved Later
        for (key in response) {
            if (fResp[response[key].origin] == null) {
                fResp[response[key].origin] = []
                filter[response[key].origin] = "productid" + odata.op("eq") + odata.qt(response[key].productid)
            }
            client.hset(SimilarHash, response[key].origin + response[key].productid, response[key].score) //Store scoring in Redis
            filter[response[key].origin] += odata.op("or") + "productid" + odata.op("eq") + odata.qt(response[key].productid)
        }
        
        var call = 0;
        
        //Get ERP data for the similar Items (Price, Qty, Name and etc..)
        for (key in filter) {
            var re = GetErpItems(key, { $filter: filter[key] }).then(function (items) {
                fResp[Object.keys(items)] = items[Object.keys(items)].values;
                call++;
    
                if (call == Object.keys(filter).length) {
                    //Retrieve Score for each item
                    mergeItemAndCache(fResp,SimilarHash).then(function(data){
                        //Able to retrieve score from cache
                        resolve(data)
                    }).catch(function () {
                        //Can't get score from cache
                        resolve(fResp)
                    })
                }
            })
        }  
    })
}

function MostSimilarItems(base, similars, callback) {
    
    // SAP Leonardo Similarity Scoring provides a N x N comparision
    // This function retrieves only the relevant similarity result for
    // a base vector(the file provided as input)
    
    var resp = {};

    for (var i = 0; i < similars.predictions.length; i++) {
        var curr_id = similars.predictions[i].id
        curr_id = curr_id.substr(0, curr_id.indexOf(path.extname(curr_id)))

        if (base.indexOf(curr_id) > 0) {
            resp = similars.predictions[i].similarVectors
            for (var j = 0; j < resp.length; j++) {
                var fileName = resp[j].id
                var score = resp[j].score
                fileName = fileName.substr(0, fileName.indexOf(path.extname(fileName)))
                resp[j] = FileToRow(fileName)
                resp[j].score = score;
            }
            callback(resp);
            break;
        }
    }
}


function CreateSimilarityZip(library, similar, callback) {
    // Create e zip file of vectors to be used by the Similarity scoring service 
    var zipFile = path.join(process.env.VECTOR_DIR, uuid.v4() + '.zip');

    // create a file to stream archive data to the zip
    var output = fs.createWriteStream(zipFile);
    var archive = archiver('zip', { zlib: { level: 9 } }); // Sets the compression level. 

    // listen for all archive data to be written 
    output.on('close', function () {
        console.log("Zip Created - " + zipFile)
        console.log("Time to call Leonardo")
        callback(null, zipFile)
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors) 
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            // log warning 
        } else {
            // throw error 
            callback(err)
        }
    });

    // good practice to catch this error explicitly 
    archive.on('error', function (err) {
        callback(err)
    });

    // pipe archive data to the file 
    archive.pipe(output);


    //Add vector to be compared (Similar) to the Zip
    var buff = Buffer.from(JSON.stringify(similar.predictions[0].feature_vector), "utf8");
    var fileName = similar.predictions[0].name
    fileName += '.txt'
    archive.append(buff, { name: fileName });


    //Add Vector library to the same zip
    for (key in library) {
        buff = Buffer.from(library[key].imgvector, "utf8");
        fileName = RowToFile(library[key])
        fileName += '.txt'
        archive.append(buff, { name: fileName });
    }
    // finalize the archive (ie we are done appending files but streams have to finish yet) 
    archive.finalize();
}

let GetErpItems = function (origin, query) {
    return new Promise(function (resolve, reject) {

        var erp = eval(origin);

        erp.GetItems(query, function (error, items) {
            if (error) {
                items = {};
                items.error = error;
            }
            var output = {};
            output[origin] = { values: items.error || items.value }

            if (items.hasOwnProperty("odata.nextLink")) {
                output[origin]["odata.nextLink"] = items["odata.nextLink"];
            }

            resolve(normalize.Items(output))
        })
    })
}

let mergeItemAndCache = function (itemList,hash){
    return new Promise(function (resolve, reject){
        
        client.hgetall(hash, function (err, replies) {
            
            if (!err){
                    console.log(replies + " scores in cache");

                for (erp in itemList){
                    for(item in itemList[erp]){
                        itemList[erp][item].score = replies[erp+itemList[erp][item].productid]
                    }
                }
                resolve(itemList);
            }else{
                reject(itemList)
            }
        });
    })
}


function GetItems(query, callback) {
    byd.GetItems(query, function (error, itemsByD) {
        if (error) {
            itemsByD = {};
            itemsByD.error = error;
        }
        b1.GetItems(query, function (error, itemsB1) {
            if (error) {
                itemsB1 = {};
                itemsB1.error = error;
            }

            var output = {
                b1: { values: itemsB1.error || itemsB1.value },
                byd: { values: itemsByD.error || itemsByD.d.results }
            }

            if (itemsB1.hasOwnProperty("odata.nextLink")) {
                output.b1["odata.nextLink"] = itemsB1["odata.nextLink"];
            }
            callback(null, normalize.Items(output))
        })
    })
}

function GetSalesOrders(query, callback) {
    byd.GetSalesOrders(query, function (error, itemsByD) {
        b1.GetOrders(query, function (error, itemsB1) {
            var output = {
                b1: itemsB1.value,
                byd: itemsByD.d.results
            }
            callback(null, normalize.SalesOrders(output))
        })
    })
}


function DownloadImage(uri, filename, callback) {
    console.log("Downloading image from " + uri)
    request.head(uri, function (err, res, body) {
        var imgPath = path.join(process.env.TEMP_DIR, filename)
        request(uri).pipe(fs.createWriteStream(imgPath)).on('close', function () {
            callback(imgPath)
        });
    });
}

function RowToFile(row) {
    return row.origin + process.env.FILE_SEP + row.productid + path.extname(row.image)
}

function FileToRow(file) {
    var row = {}
    var sep = process.env.FILE_SEP
    var ext = path.extname(file);

    row.origin = file.substr(0, file.indexOf(sep))
    file = file.substr(file.indexOf(sep) + sep.length, file.indexOf(ext))
    row.productid = file.substr(0, file.indexOf(ext))

    return row
}
