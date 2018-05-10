/**
 * Biz Logic functions 
 * this module is a "Middleware" to talk with multiple backend systems
 * it also normalizes and combine the different data structures from B1 and ByD
 * so the output data has a standard b1 format.
 */

const request = require("request");
const fs = require("fs");
const path = require("path")

const sql = require("./sql")
const leo = require("./leo")
const normalize = require("./normalize")


const b1 = require("./erp/b1")
const byd = require("./erp/byd")


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
    }
}

function SimilarItems(body, callback) {

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