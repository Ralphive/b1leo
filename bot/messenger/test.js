const ejs = require('ejs');
const fb_nlp = require('./fb_nlp');
const mockserver = require('./MockServer');
const util = require('./util');
const config = require('./config');
//Query: show me the sales and gross profit for customer C20000
exports.Top3CustomerSalesTestData = {
    "status": 0,
    "data": {
        "dashboardData": {
            "title": "",
            "chart_type": "Table",
            "strategyType": "none",
            "strategyParams": "",
            "col_titles": ["Business Partner Code"],
            "rows": [{
                "name": "Net Sales Amount (LC)",
                "data": ["2173259.75", "200000", "1000000"],
                "type": "FLOAT",
                "metaType": ""
            }, {
                "name": "Gross Profit (LC)",
                "data": ["1077739.57", "20000", "10000"],
                "type": "FLOAT",
                "metaType": ""
            }],
            "cols": [
                ["C20000"],
                ["C30000"],
                ["C40000"]
            ],
            "dashboardDetail": {
                "baseQueryId": "946",
                "actions": [],
                "chartType": "Column",
                "viewCategory": "sap.sbodemous.ar.case",
                "baseQueryName": "SalesAnalysisQuery",
                "measures": {
                    "list": [{
                        "technicalName": "NetSalesAmountLC",
                        "opt": "SUM",
                        "sorting": "DESC",
                        "metaName": "Net Sales Amount (LC)",
                        "sqlType": 2,
                        "dbType": "NUMBER"
                    }, {
                        "technicalName": "GrossProfitLC",
                        "opt": "SUM",
                        "sorting": "DESC",
                        "metaName": "Gross Profit (LC)",
                        "sqlType": 2,
                        "dbType": "NUMBER"
                    }]
                },
                "dimensions": {
                    "top": 300,
                    "list": [{
                        "technicalName": "BusinessPartnerCode",
                        "metaName": "Business Partner Code",
                        "sqlType": 1,
                        "dbType": "CHAR"
                    }]
                },
                "filters": [{
                    "field": {
                        "technicalName": "BusinessPartnerCode",
                        "sqlType": 1
                    },
                    "values": ["C20000"],
                    "operator": "ENUM"
                }, {
                    "field": {
                        "technicalName": "DocumentTypeCode",
                        "sqlType": 1
                    },
                    "values": ["13"],
                    "operator": "ENUM"
                }],
                "strategyType": "none",
                "strategyParams": "",
                "sourceType": "calculation",
                "legendColors": []
            },
            "queryDetail": "",
            "hasForecastData": false,
            "hasTimerSlider": false,
            "exception": ""
        },
        "type": "pervasivedashboard",
        "isAnswerFuzzyQuestion": false
    },
    "debugInfo": {
        "nerResult": [{
            "position": 0,
            "token": "show"
        }, {
            "position": 1,
            "token": "me"
        }, {
            "position": 2,
            "token": "the"
        }, {
            "position": 3,
            "token": "sales"
        }, {
            "position": 4,
            "token": "and"
        }, {
            "position": 5,
            "token": "gross"
        }, {
            "position": 6,
            "token": "profit"
        }, {
            "position": 7,
            "token": "for"
        }, {
            "position": 8,
            "token": "customer"
        }, {
            "position": 9,
            "tokens": ["c20000"],
            "rawSnippet": "c20000",
            "realValue": "C20000",
            "matchedFields": [{
                "score": 0,
                "source": {
                    "name": "\"_SYS_BIC\".\"sap.sbodemous.adm/BusinessPartner\"",
                    "fields": []
                },
                "name": "\"BusinessPartnerCode\"",
                "tag": "#BusinessPartnerCode#"
            }]
        }]
    }
};

exports.OneCustomerSalesTestData = {
    "status": 0,
    "data": {
        "dashboardData": {
            "title": "",
            "chart_type": "Table",
            "strategyType": "none",
            "strategyParams": "",
            "col_titles": ["Business Partner Code"],
            "rows": [{
                "name": "Net Sales Amount (LC)",
                "data": ["2173259.75"],
                "type": "FLOAT",
                "metaType": ""
            }, {
                "name": "Gross Profit (LC)",
                "data": ["1077739.57"],
                "type": "FLOAT",
                "metaType": ""
            }],
            "cols": [
                ["C30000"]
            ],
            "dashboardDetail": {
                "baseQueryId": "946",
                "actions": [],
                "chartType": "Column",
                "viewCategory": "sap.sbodemous.ar.case",
                "baseQueryName": "SalesAnalysisQuery",
                "measures": {
                    "list": [{
                        "technicalName": "NetSalesAmountLC",
                        "opt": "SUM",
                        "sorting": "DESC",
                        "metaName": "Net Sales Amount (LC)",
                        "sqlType": 2,
                        "dbType": "NUMBER"
                    }, {
                        "technicalName": "GrossProfitLC",
                        "opt": "SUM",
                        "sorting": "DESC",
                        "metaName": "Gross Profit (LC)",
                        "sqlType": 2,
                        "dbType": "NUMBER"
                    }]
                },
                "dimensions": {
                    "top": 300,
                    "list": [{
                        "technicalName": "BusinessPartnerCode",
                        "metaName": "Business Partner Code",
                        "sqlType": 1,
                        "dbType": "CHAR"
                    }]
                },
                "filters": [{
                    "field": {
                        "technicalName": "BusinessPartnerCode",
                        "sqlType": 1
                    },
                    "values": ["C20000"],
                    "operator": "ENUM"
                }, {
                    "field": {
                        "technicalName": "DocumentTypeCode",
                        "sqlType": 1
                    },
                    "values": ["13"],
                    "operator": "ENUM"
                }],
                "strategyType": "none",
                "strategyParams": "",
                "sourceType": "calculation",
                "legendColors": []
            },
            "queryDetail": "",
            "hasForecastData": false,
            "hasTimerSlider": false,
            "exception": ""
        },
        "type": "pervasivedashboard",
        "isAnswerFuzzyQuestion": false
    },
    "debugInfo": {
        "nerResult": [{
            "position": 0,
            "token": "show"
        }, {
            "position": 1,
            "token": "me"
        }, {
            "position": 2,
            "token": "the"
        }, {
            "position": 3,
            "token": "sales"
        }, {
            "position": 4,
            "token": "and"
        }, {
            "position": 5,
            "token": "gross"
        }, {
            "position": 6,
            "token": "profit"
        }, {
            "position": 7,
            "token": "for"
        }, {
            "position": 8,
            "token": "customer"
        }, {
            "position": 9,
            "tokens": ["c20000"],
            "rawSnippet": "c20000",
            "realValue": "C20000",
            "matchedFields": [{
                "score": 0,
                "source": {
                    "name": "\"_SYS_BIC\".\"sap.sbodemous.adm/BusinessPartner\"",
                    "fields": []
                },
                "name": "\"BusinessPartnerCode\"",
                "tag": "#BusinessPartnerCode#"
            }]
        }]
    }
};

exports.Top3CustomerTestData = {
    "status": 0,
    "data": {
        "dashboardData": {
            "title": "",
            "chart_type": "Column",
            "strategyType": "none",
            "strategyParams": "",
            "col_titles": ["Business Partner Code"],
            "rows": [{
                "name": "SUM(Returned Quantity (In Inv. UoM))",
                "data": ["83.00", "65.00", "58.00"],
                "type": "FLOAT",
                "metaType": ""
            }],
            "cols": [
                ["C23900"],
                ["C40000"],
                ["C70000"]
            ],
            "dashboardDetail": {
                "baseQueryId": "952",
                "actions": [],
                "chartType": "Column",
                "viewCategory": "sap.sbodemous.ar.case",
                "baseQueryName": "SalesReturnStatisticsQuery",
                "measures": {
                    "list": [{
                        "technicalName": "ReturnedQuantityInInventoryUoM",
                        "opt": "SUM",
                        "sorting": "DESC",
                        "metaName": "Returned Quantity (In Inv. UoM)",
                        "sqlType": 2,
                        "dbType": "NUMBER"
                    }]
                },
                "dimensions": {
                    "top": 3,
                    "list": [{
                        "technicalName": "BusinessPartnerCode",
                        "metaName": "Business Partner Code",
                        "sqlType": 1,
                        "dbType": "CHAR"
                    }]
                },
                "filters": [],
                "strategyType": "none",
                "strategyParams": "",
                "sourceType": "calculation",
                "legendColors": []
            },
            "queryDetail": "",
            "hasForecastData": false,
            "hasTimerSlider": false,
            "exception": ""
        },
        "type": "pervasivedashboard",
        "isAnswerFuzzyQuestion": false
    },
    "debugInfo": {
        "nerResult": [{
            "position": 0,
            "token": "top"
        }, {
            "position": 1,
            "token": "3"
        }, {
            "position": 2,
            "token": "customers"
        }]
    }
};

exports.NoData = {
    "status": 0,
    "data": {
        "dashboardData": {
            "title": "",
            "chart_type": "Column",
            "strategyType": "none",
            "strategyParams": "",
            "col_titles": ["Document Status"],
            "rows": [{
                "name": "SUM(Net Sales Amount (LC))",
                "data": [],
                "type": "FLOAT",
                "metaType": ""
            }],
            "cols": [],
            "dashboardDetail": {
                "baseQueryId": "944",
                "actions": [],
                "chartType": "Column",
                "viewCategory": "sap.sbodemous.ar.case",
                "baseQueryName": "SalesAnalysisByDocumentQuery",
                "measures": {
                    "list": [{
                        "technicalName": "NetSalesAmountLC",
                        "opt": "SUM",
                        "sorting": "DESC",
                        "metaName": "Net Sales Amount (LC)",
                        "sqlType": 2,
                        "dbType": "NUMBER"
                    }]
                },
                "dimensions": {
                    "top": 300,
                    "list": [{
                        "technicalName": "DocumentStatus",
                        "metaName": "Document Status",
                        "sqlType": 1,
                        "dbType": "CHAR"
                    }]
                },
                "filters": [{
                    "field": {
                        "technicalName": "BusinessPartnerCode",
                        "sqlType": 1
                    },
                    "values": ["C20000"],
                    "operator": "ENUM"
                }, {
                    "field": {
                        "technicalName": "PostingYear",
                        "sqlType": 1
                    },
                    "values": ["2018"],
                    "operator": "ENUM"
                }, {
                    "field": {
                        "technicalName": "DocumentTypeCode",
                        "sqlType": 1
                    },
                    "values": ["13"],
                    "operator": "ENUM"
                }],
                "strategyType": "none",
                "strategyParams": "",
                "sourceType": "calculation",
                "legendColors": []
            },
            "queryDetail": "",
            "hasForecastData": false,
            "hasTimerSlider": false,
            "exception": ""
        },
        "type": "pervasivedashboard",
        "isAnswerFuzzyQuestion": false
    },
    "debugInfo": {
        "nerResult": [{
            "position": 0,
            "token": "sales"
        }, {
            "position": 1,
            "token": "status"
        }, {
            "position": 2,
            "token": "for"
        }, {
            "position": 3,
            "tokens": ["c20000"],
            "rawSnippet": "c20000",
            "realValue": "C20000",
            "matchedFields": [{
                "score": 0,
                "source": {
                    "name": "\"_SYS_BIC\".\"sap.sbodemous.adm/BusinessPartner\"",
                    "fields": []
                },
                "name": "\"BusinessPartnerCode\"",
                "tag": "#BusinessPartnerCode#"
            }]
        }, {
            "position": 4,
            "token": "in"
        }, {
            "position": 5,
            "token": "2018"
        }]
    }
};

const msg_nlp = {
    "mid": "mid.$cAAdmRuuSPSlmX98gTVgLpnbvDCrd",
    "seq": 3199,
    "text": "check customer c20000",
    "nlp": {
        "entities": {
            "customer_code": [{
                "confidence": 0.9882424805545,
                "value": "C20000",
                "type": "value",
                "_entity": "customer_code",
                "_body": "c20000",
                "_start": 15,
                "_end": 21
            }],
            "intent": [{
                "confidence": 0.99868931773592,
                "value": "ShowCustomer",
                "_entity": "intent"
            }]
        }
    }
};

function encodeData(testData) {
    let result = Buffer.from(JSON.stringify(testData)).toString('base64'); //btoa(JSON.stringify(testData)); 
    console.log(result);
    console.log(result.length);
    result = (Buffer.from(result, 'base64').toString()); //atob(result);
    console.log(result);
    console.log(result.length);
}
// printDashboardData(exports.Top3CustomerTestData);
// printDashboardData(exports.Top3CustomerSalesTestData);
// exports.proceedDashboardData(exports.Top3CustomerTestData);
// exports.proceedDashboardData(exports.Top3CustomerSalesTestData);
//encodeData(exports.Top3CustomerSalesTestData);

//let labels = ["January", "February", "March", "April"];
//encodeData(labels);

//encodeData(b1BotProxy.proceedDashboardData4Chartjs(exports.Top3CustomerSalesTestData));
//let test = b1BotProxy.buildChartUrl(exports.Top3CustomerSalesTestData);
//console.log(test);
//console.log(Math.floor(6.5));

//test for B1BotProxy.proceedDashboardData
//b1BotProxy.proceedDashboardData(exports.NoData);
//b1BotProxy.proceedDashboardData4Chartjs(exports.NoData);

let test = [];
//console.log(`[].length: ${test.length}`);

let intent = fb_nlp.getNlpFirstIntent(msg_nlp.nlp);
//console.log(intent);

function random(max)
{
    return Math.floor((Math.random() * max));
}

function testRandom(count, max)
{
    for(let i = 0; i < count; i++){
        console.log(random(max));
    }
}

const generalIntents = require('./GeneralIntents');
function GeneralIntentReply(targetIntent){
    generalIntents.forEach(element =>{
        if(element.intent === targetIntent)
        {
            let count = element.replies.length;
            let reply = element.replies[random(count)];
            console.log(reply);
            return reply;
        }
    })
}

//testRandom(10, 3);
function testGeneralIntents(runCount)
{
    let testIntents = ['BotAge', 'BotName', 'BotGender', 'BotCreator', 'B1MovieStar', 'ShowCart'];
    let max = testIntents.length;
    for(let i = 0; i < runCount; i++){
        let randomIndex = random(max);
        console.log(`${randomIndex} - ${testIntents[randomIndex]}`);
        GeneralIntentReply(testIntents[randomIndex]);
    }
}

//GeneralIntentReply('B1MovieStar');
testGeneralIntents(30);

function testEncodedProductData()
{
    let data = {};
    data.selectedProduct = mockserver.ImageSimilarityAPIResult[0];
    data.similarProducts = mockserver.ImageSimilarityAPIResult;

    encodeData(data);
}
//testEncodedProductData();

function testFormatItemResult()
{
    let data = {
        "byd": [
            {}
        ],
        "b1": [
            {
                "productid": "SH0010",
                "name": "Men's Hiking Boots",
                "image": "https://i.imgur.com/TwgWkagt.png",
                "score": "0.7771815875231416"
            },
            {
                "productid": "SH10008",
                "name": "Mens Running Sneaker",
                "image": "https://i.imgur.com/PLYdI80m.png",
                "score": "0.7907924967311178"
            },
            {
                "productid": "SH10009",
                "name": "Men's High Top Sneaker",
                "image": "https://i.imgur.com/fI4Q3nCt.png",
                "score": "0.7967721630722064"
            }
        ]
    };

    let result = util.FormatItemResult(data)
    console.log(JSON.stringify(result));
}

//testFormatItemResult();

//console.log(config.getFbUserLocationUrl('1721196817934442'));