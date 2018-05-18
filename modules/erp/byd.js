/* Module to manipulate ByD data */

var client; //Redis Client

module.exports = {
    GetItems: function (options, callback) {
        return (GetItems(options, callback))
    },
    GetSalesOrders: function (options, callback) {
        return (GetSalesOrders(options, callback))
    },
    GetItemPrice: function (options, callback) {
        return (GetItemPrice(options, callback))
    },
    PostSalesOrder: function (body, callback) {
        return (PostSalesOrder(body, callback))
    },
    setClient: function (inClient) { client = inClient; }
}

const request = require('request')  // HTTP Client
const qs = require("qs")
const sql = require("../sql")

const moment = require('moment')    // Date Time manipulation
const odata = require('../odata')

//Hash Keys for Redis DB
const hash_Session = "byd_SessionID"
const hash_csrf = "byd_CSRF"

//ByD Models
const model_sales = "/khsalesorderdemo/SalesOrderCollection"
const model_items = "/byd_items/MaterialCollection"

//Load Environment Variables
const ByDServer = process.env.BYD_SERVER + ":" + process.env.BYD_PORT + process.env.BYD_PATH;
const ByDHeader = {
    url: ByDServer,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Basic " + process.env.BYD_AUTH,
        "x-csrf-token": "fetch",
        "Cookie": ""
    }
};


function ByDRequest(options, callback) {

    getCookiesCache(options.method).then(function (cookies) {
        if (options.headers == null) { options.headers = [] }

        options.headers["Cookie"] = cookies

        getTokenCache(options.method).then(function (csrfToken) {

            options.headers["x-csrf-token"] = csrfToken
            options.headers["Accept"] = "application/json"
            options.headers["Content-Type"] = "application/json"
            options.headers["Authorization"] = "Basic " + process.env.BYD_AUTH
            console.log("Preparing BYD Request:" + JSON.stringify(options))

            request(options, function (error, response, body) {
                if (error) {
                    console.error(error.message)
                } else {
                    if (response.statusCode == 403) {
                        console.log("Invalid CSRF token. Reconnecting..")
                        //Invalid Token

                        Connect().then(function () {
                            ByDRequest(options, callback)
                        }).catch(function (error, response) {
                            callback(error, response)
                        })
                    } else {
                        console.log("Request response with status: " + response.statusCode +
                            "\nRequest headers: " + JSON.stringify(response.headers))
                        callback(error, response, JSON.parse(body));

                    }
                }
            });
        })
            .catch(function () {

                Connect().then(function () {
                    ByDRequest(options, callback)
                }).catch(function (error, response) {
                    callback(error, response)
                })
                // }
            })
    })
        .catch(function (e) {

            console.error(e)
            Connect().then(function () {
                ByDRequest(options, callback)
            }).catch(function (error, response) {
                callback(error, response)
            })
            // }
        })
}

function GetItems(query, callback) {
    var options = {};
    var select = "" //"InternalID,Description,BaseMeasureUnitCode"

    if (query && query.hasOwnProperty("$filter")) {
        //To be replaced by Normalize.ItemQuery()
        query["$filter"] = query["$filter"].replace(new RegExp('productid', 'g'), "InternalID")
    } else {
        if (!query) { query = []; }
    }

    query["$expand"] = "MaterialTextCollection"


    options.url = getByDserver() + model_items
    options.method = "GET"
    options.qs = odata.formatQuery(query, select)

    ByDRequest(options, function (error, response, bodyItems) {
        if (error) {
            callback(error);
        } else {

            // Another request to retrieve the Item Quantities and prices
            // that are not available in the Item Odata Service.

            // ** \/ I am not proud of this \/ ** 
            var optQty = {
                url: process.env.BYD_SERVER + "/sap/byd/odata/scm_physicalinventory_analytics.svc/RPSCMINBU01_Q0001QueryResults",
                qs: qs.parse("$format=json&$select=CMATERIAL_UUID,KCENDING_QUANTITY")
            }
            ByDRequest(optQty, function (error, response, bodyQty) {
                if (error) {
                    callback(null, formatByDResp(bodyItems));
                } else {

                    //And Now the ByD Item Prices Stored Previously
                    sql.SelectErpItemsPrices("byd", function (erro, prices) {

                        var Qtys = bodyQty.d.results
                        var Items = bodyItems.d.results

                        for (item in Items) {
                            for (qty in Qtys) {
                                if (Items[item].InternalID == Qtys[qty].CMATERIAL_UUID) {
                                    Items[item].KCENDING_QUANTITY = Qtys[qty].KCENDING_QUANTITY
                                }
                            }

                            for (price in prices) {
                                if (Items[item].InternalID == prices[price].productid) {
                                    Items[item].price = prices[price].price
                                    Items[item].pricecurrency = prices[price].currency
                                }
                            }

                            if (Items[item].KCENDING_QUANTITY == null) { Items[item].KCENDING_QUANTITY = 0 }
                            if (Items[item].price == null) { Items[item].price = null; Items[item].pricecurrency = null; }

                            if (item == (Items.length - 1)) {
                                bodyItems.d.results = Items;
                                callback(null, formatByDResp(bodyItems));
                            }
                        }

                    })
                }
            })
            // /\ ** I am not proud of this /\ ** 

        }
    });
}

function GetItemPrice(query, callback) {
    var options = {};

    if (query && query.hasOwnProperty("$filter")) {
        //To be replaced by Normalize.ItemQuery()
        query["$filter"] = query["$filter"].replace(new RegExp('productid', 'g'), "CIPR_PRODUCT")
    } else {
        if (!query) { query = []; }
    }
    query["$select"] = "CIPR_PRODUCT,KCZF8AB2100987110A811399E,RCITV_NET_AMT_RC"
    query["$format"] = "json"

    options = {
        url: process.env.BYD_SERVER + "/sap/byd/odata/ana_businessanalytics_analytics.svc/RPZBB683E8960C6B776E12234QueryResults",
        method: "GET",
        qs: query
    }

    ByDRequest(options, function (error, response, bodyItems) {
        if (error) {
            console.error(error)
            callback(error);
        } else {
            callback(null, formatByDResp(bodyItems));

        }
    });
}

function GetSalesOrders(query, callback) {
    var options = {}
    var select = ""

    options.url = getByDserver() + model_sales
    options.method = "GET"
    options.qs = odata.formatQuery(query, select)

    ByDRequest(options, function (error, response, body) {
        if (error) {
            callback(error);
        } else {
            callback(null, formatByDResp(body));
        }
    });
}

function PostSalesOrder(body, callback) {
    var opt = {
        url: getByDserver() + model_sales,
        method: "POST",
        headers: [],
        body: {
            "ExternalReference": "From SMB Mkt Place",
            "DataOriginTypeCode": "1",
            "Name": "Order created via SMB Mkt Place @" + moment.now(),
            "SalesOrderBuyerParty": {
                "PartyID": process.env.BYD_DEFAULT_BP
            },
            "SalesOrderItem": []
        }
    }

    //    opt.url = opt.url.substr(0,opt.url.indexOf("?"))



    for (item in body.lines) {
        var item = {
            "ID": String((item * 1 + 1) * 10), //Lines in BYD are 10, 20 , 30...
            "SalesOrderItemProduct": {
                "ProductID": body.lines[item].productid
            },
            "SalesOrderItemScheduleLine": [
                {
                    "Quantity": String(body.lines[item].Quantity)
                }
            ]
        }
        opt.body.SalesOrderItem.push(item)
    }
    opt.body = JSON.stringify(opt.body);

    ByDRequest(opt, function (error, response, body) {
        if (error) {
            callback(error);
        } else {
            callback(null, formatByDResp(body));
        }
    });



}

let Connect = function () {

    /* There is no "login" endpoint in ByD. Instead the Base64 credentials should be passed in
     * the header of a GET Request. From the response of this request, we retrieve a CSRF token
     * that is required for any other method (POST/PATCH/DELETE etc...). Session Cookies are also 
     * required and in this app all of them are stored in cache.
     **/

    return new Promise(function (resolve, reject) {

        var options = {
            url: getByDserver() + model_sales,
            method: "GET"
        };

        ByDRequest(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("BYD Reached successfully!")
                setCookiesCache(response.headers['set-cookie'], function () {
                    setByDToken(response.headers["x-csrf-token"])
                    resolve();
                });
            } else {
                console.error("Error reaching ByD. \n" + response.statusCode + " - " + error)
                reject(error, response);
            }
        });


        // //Make Request
        // baserequest.get(options, function (error, response, body) {
        //     if (!error && response.statusCode == 200) {
        //         console.log("BYD Reached successfully!")
        //         setCookiesCache(response.headers['set-cookie'], function () {
        //             setByDToken(response.headers["x-csrf-token"])
        //             resolve();
        //         });
        //     } else {
        //         console.error("Error reaching ByD. \n" + response.statusCode + " - " + error)
        //         reject(error, response);
        //     }
        // });
    })

}

let getCookiesCache = function (method) {
    return new Promise(function (resolve, reject) {

        if (method == "GET" || method == "HEAD") {
            // Get Method doesnt require token
            return resolve(null)
        }

        client.lrange(hash_Session, 0, -1, function (err, cookies) {
            if (cookies.length > 0) {
                console.log("Cached ByD cookies Retrieved")
                resolve(cookies)
            } else {
                console.log("Cached ByD cookies not found")
                reject();
            }
        });
    })
}

let getTokenCache = function (method) {
    return new Promise(function (resolve, reject) {

        if (method == "GET" || method == "HEAD") {
            // Get Method doesnt require token
            return resolve("fetch")
        }

        client.hget(hash_csrf, hash_csrf, function (error, csrfToken) {
            if (!csrfToken) {
                //No Token in cache
                console.log("No ByD CSRF Token in cache")
                reject()
            } else {
                resolve(csrfToken)

            }
        })
    })
}


function setCookiesCache(cookies, callback) {
    // Dump Previous Cookies Cache and creates a new one
    client.del(hash_Session, function () {
        client.rpush(hash_Session, cookies, function () {
            console.log("Storing ByD Cookies in cache")
            callback();
        });
    })
}

function setByDToken(csrfToken) {
    //Store the Session Timeout
    client.hset(hash_csrf, hash_csrf, csrfToken)
    console.log("Storing ByD CSRF token in cache")
}

function formatByDResp(output) {
    if (output.hasOwnProperty("d")) {
        output = output.d
    }

    if (output.hasOwnProperty("results")) {
        output.value = output.results
        delete output.results;
    }

    return output
}

function getByDHeader() {
    return ByDHeader
}

function getByDserver() {
    return ByDServer
}