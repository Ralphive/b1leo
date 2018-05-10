/*
 * SAP SMB Assistant Bot in Facebook Messenger
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Update the VERIFY_TOKEN in config.js
 * 4. Add your PAGE_ACCESS_TOKEN to your environment vars
 *
 */

'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || 'EAAC1crXKdJcBALxOvdCIjdCnoAkU2F9JVM2NR8WR8mqzS3EcxfW1V70cjBgWuFIYZCQUUuejBpKxUKiZC9ZAS4F0PZBnBZA7q4D0sUH2SA8gS80WxfXutOR1AzxgMvY8XHqQZCNGjhz0qBPjKqnhfcZBpApNPadhqnfXYSdRPklaAZDZD';
const PORT = process.env.PORT || 1338;
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
    mockServer = require('./MockServer');
    //b1BotProxy = require('./B1ChatbotProxy.js');
    
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

app.get('/web/viewChart', (req, res) => {
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

    res.render(path.join(__dirname, './views/chart'), {
        title: title,
        labels: labels,
        datasets: datasets
    });
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
    let similarProducts = data.similarProducts;
    res.render(path.join(__dirname, './views/Products'), {
        selectedProduct: selectedProduct,
        similarProducts: similarProducts
    });
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
function handleIntent(sender_psid, intent)
{
    let repsonse;
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

function handleImageMessage(sender_psid, image)
{
    let response = config.ListTemplate;
    response.attachment.payload.elements = mockServer.FormatElments(mockServer.ImageSimilarityAPIResult);
    //response.attachment.payload.elements = config.ElementList;
    response.attachment.payload.buttons[0].url = mockServer.BuildViewProductsUrl(mockServer.ImageSimilarityAPIResult);
    
    callSendAPI(sender_psid, response);
}

function handleShowCartIntent(sender_psid)
{
    let response = config.ListTemplate;
    response.attachment.payload.elements = mockServer.FormatElments(mockServer.ImageSimilarityAPIResult);
    //response.attachment.payload.elements = config.ElementList;
    response.attachment.payload.buttons[0].url = mockServer.BuildViewProductsUrl(mockServer.ImageSimilarityAPIResult);
    
    callSendAPI(sender_psid, response);
}

function handleMessage(sender_psid, received_message) {
    //ignore the response from ping the webhook.
    console.log(received_message);
    let response ={};

    if(received_message.attachments)
    {
        received_message.attachments.forEach(element =>{
            if(element.type === 'image')
            {
                handleImageMessage(sender_psid, element);
            }
            else
            {
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

    if(intent === i18n.ShowCartIntent)
    {
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
        }
    });
}