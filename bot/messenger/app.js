/*
 * SAP SMB Assistant Bot in Facebook Messenger
 *
 * To run this code, you must do the following:
 * 1. Follow the facebook developer manual to create a messenger bot with message and user_location service https://developers.facebook.com/docs/messenger-platform/getting-started
 * 2. Update the VERIFY_TOKEN for your messenger bot in config.js, which will be used on registered the web hook to fb messenger
 * 3. Update the PAGE_ACCESS_TOKEN for your messenger bot in config.js
 * 4. Deploy this code to a server running Node.js
 * Option 1: Deploy to SAP Cloud Platform, Cloud Foundry
 * Step 1: run 'cf login' to login SAP Cloud Platform, Cloud Foundry wity your credential
 * Step 2: run 'cf push' to deploy the app to SAP Cloud Platform, Cloud Foundry.
 * As result, you can find out the urls of your messenger bot.
 * for example: https://sap-smbassistantbot.cfapps.eu10.hana.ondemand.com (Please add https:// at the beginning of url)
 * Step 3: Setup the web hook of the messenger bot with url above. You need to enter the VERIFY_TOKEN you have setup in step 2 above.
 * 
 * Option 2: Deploy the a server with nodejs run-time.
 * Step 1: run 'npm install' to install dependence of the app
 * Step 2: run 'npm start' to start the app
 */
'use strict';

// Imports dependencies and set up http server
const
    request = require('request'),
    express = require('express'),
    path = require('path'),
    body_parser = require('body-parser'),
    app = express().use(body_parser.json()), // creates express http server
    //    test = require('./test'),
    ejs = require('ejs'),
    i18n = require('./i18n'),
    config = require('./config'),
    fb_nlp = require('./fb_nlp'),
    mockServer = require('./MockServer'),
    util = require('./util'),
    intentHelper = require('./IntentHelper'),
    axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || config.AccessToken;
const PORT = process.env.PORT || config.Port;
const ENABLE_DETECTOR = process.env.ENABLE_DETECTOR || true;
const DETECTOR = process.env.DETECTOR || 'tensorflow';

console.log('app started');
app.use('/web', express.static(path.join(__dirname, './views')));

app.set('view engine', 'ejs');
// Sets server port and logs message on success
app.listen(PORT, () => console.log(`SMBs Market Place Assistant webhook is listening at https://127.0.0.1:${PORT}/webhook`));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender ID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });
        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

app.get('/web/Products', (req, res) => {

    if (!req.query.data) {
        res.status(500).json({
            'error': 'No data passed in the URL parameters'
        });
        return;
    }

    let data = req.query.data;
    data = (Buffer.from(data, 'base64').toString());
    // Parse the request body from the POST
    data = JSON.parse(data);

    //var labels = data.labels;
    // let selectedProduct = mockServer.ImageSimilarityAPIResult[3];
    // let similarProducts = mockServer.ImageSimilarityAPIResult;
    let selectedProduct = data.selectedProduct;
    let similarProducts = []; //data.similarProducts;
    data.similarProducts.forEach(product => {
        if (product.productid !== selectedProduct.productid) {
            similarProducts.push(product);
        }
    });
    res.render(path.join(__dirname, './views/Products'), {
        selectedProduct: selectedProduct,
        similarProducts: similarProducts
    });
});

app.get('/web/Store', (req, res) => {

    /* if (!req.query.data) {
        res.status(500).json({
            'error': 'No data passed in the URL parameters'
        });
        return;
    }
    
    let data = req.query.data;
    data = (Buffer.from(data, 'base64').toString());
    // Parse the request body from the POST
    data = JSON.parse(data); 
    */
    //default user_id and location.
    let user_id = '1721196817934442';
    let location = {};
    location.lat = -37.8136;
    location.lng = 144.9631;
    //let address = 'Melbourne, Victoria';
    let address = {
        'address': 'Sao Paulo, Brazil'
    };
    try {
        axios.get(config.getFbUserLocationUrl(user_id))
            .then(res2 => {
                let user = res2.data;
                console.log(user);

                if (util.CheckType(user) && util.CheckType(user.location) && util.CheckType(user.location.name)) {
                    address = user.location.name;
                }
            });
    } catch (error) {
        console.log(error);
    } finally {
        res.render(path.join(__dirname, './views/Store'), {
            location,
            address
        });
    }
    // axios.get(config.getFbUserLocationUrl(user_id))
    // .then(res2 =>{
    //     let user = res2.data;
    //     console.log(user);

    //     if(util.CheckType(user) && util.CheckType (user.location) && util.CheckType(user.location.name)){
    //         address = user.location.name;
    //     }
    //     res.render(path.join(__dirname, './views/Store'), {
    //         location,
    //         address
    //     });
    // })
    // .catch(error => {
    //     console.log(error);
    //     res.render(path.join(__dirname, './views/Store'), {
    //         location,
    //         address
    //     });
    //   });; 
});

app.get('/web/ShoppingCart', (req, res) => {
    /* 
    if (!req.query.data) {
        res.status(500).json({
            'error': 'No data passed in the URL parameters'
        });
        return;
    }
    
    let data = req.query.data;
    data = (Buffer.from(data, 'base64').toString());
    // Parse the request body from the POST
    data = JSON.parse(data);

    //var labels = data.labels;
    let title = data.Title;
    let labels = data.Dimensions;
    let datasets = data.Measures; 
    */

    res.render(path.join(__dirname, './views/ShoppingCart'), {
        products: mockServer.ImageSimilarityAPIResult
    });
});

app.get('/web/DeliverySetting', (req, res) => {
    res.render(path.join(__dirname, './views/DeliverySetting'), {});
});

app.get('/web/PaymentSetting', (req, res) => {
    res.render(path.join(__dirname, './views/PaymentSetting'), {});
});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
    // Parse params from the webhook verification request
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Check if a token and mode were sent
    if (mode && token) {

        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === config.VERIFY_TOKEN) {

            // Respond with 200 OK and challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

function isGreeting(text) {
    return text === 'hi' || (text.includes('hi ') && !text.includes('hi milton,')) ||
        (text.includes('hey') && !text.includes('hey milton,')) ||
        (text.includes('hello') && !text.includes('hello milton,')) ||
        (text.includes('ola') && !text.includes('ola milton,')) ||
        (text.includes('olá') && !text.includes('olá milton,')) ||
        (text.includes('ciao') && !text.includes('ciao milton,')) ||
        text.includes('greeting');
}

function isBye(text) {
    return text === 'bye' || text === 'bye bye' || text === 'good bye' || text.includes('bye');
}

function isThank(text) {
    return text.includes('thank') || text.includes('gracia');
}

/**
 * A generic text intent handler
 * @param {sender id} sender_psid 
 * @param {the identified intent} intent 
 */
function handleIntent(sender_psid, intent) {
    let response;
    if (intent) {
        let reply = fb_nlp.GeneralIntentReply(intent);
        response = {
            'text': reply
        };
        if (reply) {
            callSendAPI(sender_psid, response);
            return;
        }
    }
}

function handleImageMessage(sender_psid, image_url) {
    try {
        //If the detector is enabled for image pre-processing.
        if (ENABLE_DETECTOR) {
            let request_body = {
                'ImageUrl': image_url
            };
            request({
                    url: config.getImagePreprocessUrl(DETECTOR),
                    method: "POST",
                    json: request_body
                },
                function (error, resp, body) {
                    if(error)
                    {
                        console.error(error);
                        console.log(resp);
                    }
                    console.log(body);
                    //no shoe detected
                    if (body && body.ReturnCode && body.ReturnCode === -99) {
                        console.log('No shoe detected');
                        let response = intentHelper.GenerateTextResponse(i18n.NoShoeDetectedReply);
                        callSendAPI(sender_psid, response);
                    } else {
                        //shoe detected, pro-process the image and send the cropped image for item similarity
                        handleItemSimilarity(sender_psid, image_url);
                    }
                }
            );
        }
    } catch (error) {
        console.error(error);
    }
}

function handleItemSimilarity(sender_psid, image_url) {
    let response;
    let request_body = {
        'url': image_url
    };
    request({
            //url: 'https://shoe-detector-yolo.cfapps.eu10.hana.ondemand.com/Detect',
            url: 'https://smbmkt.cfapps.eu10.hana.ondemand.com/SimilarItems',
            method: "POST",
            json: request_body
        },
        function (error, resp, body) {
            if (error) {
                console.log('error caught in handleItemSimilarity!');
                console.error(error);
                //At current stage, only Internal Server Problem-image resolution too high falling into this.
                response = intentHelper.GenerateTextResponse(i18n.ImageResolutionErrReply);
                //response = intentHelper.GenerateTextResponse(i18n.GenericAPIErrorReply);
                callSendAPI(sender_psid, response);
                return;
            }
            console.log(body);
            let result = util.FormatItemResult(body);
            console.log(JSON.stringify(result));

            if (result && result.length === 0) {
                //no matched product found.
                response = intentHelper.GenerateTextResponse(i18n.NoMatchedProductReply);
            } else if (result.length === 1) {
                //only matched product found, render with Generic Templage.
                response = config.GenericTemplate;
                let entry = response.attachment.payload.elements[0];
                let product = result[0];

                entry.title = `${product.productid}(${product.score})`;
                entry.subtitle =
                    `${product.name}
Price: ${product.price}${product.priceCurrency}
In Stock: ${product.inventoryLevel}`;
                entry.image_url = product.image;

                let data = {};
                data.selectedProduct = product,
                    data.similarProducts = [];
                let productUrl = config.getProductUrl(util.encodeData(data));
                entry.buttons[0].url = productUrl;
                console.log(`add2chart url
${productUrl}`);
            } else {
                //multiple matched products found, render with list template
                response = config.ListTemplate;
                response.attachment.payload.elements = util.FormatElments2(result);
                response.attachment.payload.buttons[0].url = util.BuildViewProductsUrl(result);
                console.log(response.attachment.payload.buttons[0].url);
            }

            callSendAPI(sender_psid, response);
        });
}

function handleShowCartIntent(sender_psid) {
    let response = config.ListTemplate;
    response.attachment.payload.elements = mockServer.FormatElments(mockServer.ImageSimilarityAPIResult);
    //response.attachment.payload.elements = config.ElementList;
    response.attachment.payload.buttons[0].url = mockServer.BuildViewProductsUrl(mockServer.ImageSimilarityAPIResult);

    callSendAPI(sender_psid, response);
}

function handleMessage(sender_psid, received_message) {
    //ignore the response from ping the webhook.
    console.log(received_message);
    let response = {};

    if (received_message.attachments) {
        received_message.attachments.forEach(element => {
            if (element.type === 'image') {
                handleImageMessage(sender_psid, element.payload.url);
            } else {
                handleIntent(sender_psid, 'InvalidAttachment');
            }
        });

        console.log('Attachment payload:');
        console.log(received_message.attachments[0].payload);
        return;
    }

    // if (!received_message.text)
    //     return;
    console.log(`MessageObject: ${JSON.stringify(received_message)}`);
    let text = received_message.text.toLowerCase();
    let nlp = received_message.nlp;
    //let intent = getNlpFirstIntent(nlp);
    let intent;
    if (config.EnableFbNlp) {
        intent = fb_nlp.getFirstNlpIntentName(nlp);
        console.log(`Intent by fb nlp: ${intent}`);

        if (intent) {
            let reply = fb_nlp.GeneralIntentReply(intent);
            response = {
                'text': reply
            };
            if (reply) {
                callSendAPI(sender_psid, response);
                return;
            }
        }
    }

    if (intent === i18n.ShowCartIntent) {
        handleShowCartIntent(sender_psid);
    }

    //custom intent handler
    //grettings: Login & grettings
    if (fb_nlp.getNlpFirstEntity(nlp, 'greetings') === 'true' || isGreeting(text)) {
        response = {
            "text": i18n.Welcome
        };
        /* b1BotProxy.login('SBODEMOUS', 'manager', '1234')
            .then(res => {
                response = {
                    "text": i18n.Welcome
                };
                callSendAPI(sender_psid, response);
            })
            .catch(err => {
                console.log(err);
                response = {
                    "text": i18n.LoginErrorResponse
                };
                callSendAPI(sender_psid, response);
            }); */
    } else if (intent === 'GoodBye' || isBye(text)) {
        response = {
            "text": i18n.GoodByeResponse
        };
        //callSendAPI(sender_psid, response);
    } else if (intent === 'ThankYou' || isThank(text)) {
        response = {
            "text": i18n.ThankYouResponse
        };
        //callSendAPI(sender_psid, response);
    }
    // special intent for the demo, it only for default NLP enabled  
    else if (intent && intent === 'ShowCustomer') {
        let customer_code = getNlpFirstEntity(nlp, 'customer_code');
        console.log('ShowCustomer Intent');

        response = {
            "text": i18n.ThankYouResponse
        };
    } else {

        response = {
            'text': i18n.ErrorResponse
        }
        //Handover to B1 Chatbot API for process
        //rendering the result from B1 Chatbot API with message template

        /* b1BotProxy.message(text)
            .then(res => {
                let elements = b1BotProxy.proceedDashboardData(res.data);
                if (elements && elements.length === 0) {
                    //no data.
                    response = {
                        "text": i18n.NoDataResponse
                    };
                } else if (elements && elements.length && elements.length === 1) {
                    //only one element in the result
                    //Generic template
                    //It has words number limit around 
                    let strLen = elements[0].title.length + elements[0].subtitle.length;
                    if (strLen < 60) {
                        response = config.GenericTemplate;
                        response.attachment.payload.elements[0].title = elements[0].title;
                        response.attachment.payload.elements[0].subtitle = elements[0].subtitle;
                        response.attachment.payload.elements[0].buttons[0].url = b1BotProxy.buildChartUrl(res.data);
                    } else {
                        //too many words, then text only.
                        response = {
                            "text": `${elements[0].title}\n${elements[0].subtitle}`
                        };
                    }
                } else {
                    //List Template for multiple elements
                    response = config.ListTemplate;
                    response.attachment.payload.elements = elements;
                    response.attachment.payload.buttons[0].url = b1BotProxy.buildChartUrl(res.data);
                }
                callSendAPI(sender_psid, response);
            })
            .catch(err => {
                console.log(err);

                response = {
                    "text": i18n.ErrorResponse
                };
                callSendAPI(sender_psid, response);
            }); */
    }

    // Send the response message
    callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
    console.log('ok')
    let response;
    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = {
            "text": "Thanks!"
        }
    } else if (payload === 'no') {
        response = {
            "text": "Oops, try sending another image."
        }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    //console.log(JSON.stringify(request_body));
    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/me/messages",
        "qs": {
            "access_token": PAGE_ACCESS_TOKEN
        },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err && res.statusCode === 200) {
            console.log('message sent!');
        } else {
            console.log('HTTP Response Status Code:', res && res.statusCode);
            console.log('Body:', JSON.stringify(body));
            console.error("Unable to send message:" + err);
            if (body && body.error && body.error.message) {
                let msg = `${i18n.FBMessageAPIErrorReply} ${body.error.message}`;
                callSendAPI(sender_psid, intentHelper.GenerateTextResponse(msg));
            }
        }
    });
}