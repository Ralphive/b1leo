module.exports = {
    Items: function (data, callback) {
        return (NormalizeData("Items", data))
    },
    SalesOrders: function (data, callback) {
        return (NormalizeData("SalesOrders", data))
    }
}

const path = require('path')
const fs = require('fs')

function NormalizeData(dataType, data) {

    console.log("Starting data normalization for " + dataType)

    var normData = {}
    for (property in data) {
        var formatPath = path.join(__dirname, 'schemas', property, dataType + ".json")
        console.log("Reading normalization schema for " + property + " from " + formatPath);
        normData[property] = data[property]
        if (!fs.existsSync(formatPath)) {
            // If there is no schema, don't normalize
            console.error("No normalization schema found for " + path.join('schemas', property, dataType))
        } else {
            var format = JSON.parse(fs.readFileSync(formatPath, 'utf8'));
            normData[property].values = Normalize(data[property].values, format)
            console.log("Data normalized")
        }
    }
    return normData
}

function Normalize(input, format) {
    var data = [];
    var json;
    for (var i = 0; i < input.length; i++) {
        json = input[i];
        var item = {}
        for (var property in format) {
            if (json.hasOwnProperty(property)) {
                if (Array.isArray(json[property])) {
                    item[property] = Normalize(json[property], format[property][0])
                } else {
                    item[format[property]] = json[property];
                }
            }
        }
        if (Object.keys(item).length) {
            //item is not empty
            data.push(item)
        }
    }
    return data;
}