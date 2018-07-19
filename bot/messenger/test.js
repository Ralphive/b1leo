const ejs = require('ejs');
const fb_nlp = require('./fb_nlp');
const mockserver = require('./MockServer');
const util = require('./util');
const generalIntents = require('./GeneralIntents');
const config = require('./config');

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

runTests();

function runTests() {
    //test 1: testRandom
    //testRandom(10, 3);

    //test2: testGeneralIntents
    //testGeneralIntents(30);

    //test3: testEncodedProductData
    //testEncodedProductData();

    //test4 spice
    //testSpice();

    //test5:
    //testFormatItemResult();

    //test6:
    //console.log(config.getFbUserLocationUrl('1721196817934442'));

    //test7:
    testCheckEV();
}

function testCheckEV()
{
    //config.CheckEnvVariable('SMBMKT_BACKEND_URL');
    config.CheckEnvVariable('DUMMY');
}

function encodeData(testData) {
    let result = Buffer.from(JSON.stringify(testData)).toString('base64'); //btoa(JSON.stringify(testData)); 
    console.log(result);
    console.log(result.length);
    result = (Buffer.from(result, 'base64').toString()); //atob(result);
    console.log(result);
    console.log(result.length);
}


function test_fb_nlp_intent()
{
    let intent = fb_nlp.getNlpFirstIntent(msg_nlp.nlp);
    console.log(intent);
}

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

function testEncodedProductData()
{
    let data = {};
    data.selectedProduct = mockserver.ImageSimilarityAPIResult[0];
    data.similarProducts = mockserver.ImageSimilarityAPIResult;

    util.encodeData(data);
}


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

function testSpice()
{
    let   myArray = ['a', 'b', 'c', 'd'];
    myArray.splice(0, 2);
    console.log(JSON.stringify(myArray));
}


