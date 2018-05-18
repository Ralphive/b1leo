exports.smbmkt_root_url = 'https://smbmkt.cfapps.eu10.hana.ondemand.com/';
exports.smbmkt_similarity_endpoint = 'SimilarItems';
//production url
exports.smbmkt_bot_root_url = 'https://sap-smbassistantbot.cfapps.eu10.hana.ondemand.com'
//debug url
//exports.smbmkt_bot_root_url = 'https://39fcc97f.ngrok.io'
exports.ViewProductUrl = `${exports.smbmkt_bot_root_url}/web/Products?data=`;
exports.Decimal = 2;
exports.FbMaxNoInList = 4;
exports.EnableFbNlp = true;
exports.NlpConfidenceThreshhold = 0.80;
exports.VERIFY_TOKEN = "yatsea-SMBAssistantBot";
exports.ListTemplate = {
    "attachment": {
        "type": "template",
        "payload": {
            "template_type": "list",
            "top_element_style": "large",
            "elements": [],
            "buttons": [{
                "type": "web_url",
                "title": "View More",
                "webview_height_ratio": "tall",
                //"url": "https://6f41daef.ngrok.io/b1chatbot/client/test.html",
                "url": "https://sap-smbassistantbot.cfapps.eu10.hana.ondemand.com/web/Products?data="
            }],
        }
    }
};

exports.ElementTemplate = `{
    "title": "",
    "image_url": "",
    "subtitle": "",
    "default_action": {
        "type": "web_url",
        "url": "",
        "messenger_extensions": true,
        "webview_height_ratio": "tall",
        "fallback_url": ""
    },
    "buttons": [
        {
            "title": "View Detail",
            "type": "web_url",
            "url": "",
            "messenger_extensions": true,
            "webview_height_ratio": "tall",
            "fallback_url": ""
        }
    ]
}`;

exports.GenericTemplate = {
    "attachment": {
        "type": "template",
        "payload": {
            "template_type": "generic",
            "image_aspect_ratio": "square",
            "elements": [{
                "title": "<Placeholder>",
                "subtitle": "<Placeholder>",
                "buttons": [{
                    "type": "web_url",
                    "title": "View Chart",
                    "webview_height_ratio": "compact",
                    "url": "https://b1assistantmessengerbot.cfapps.eu10.hana.ondemand.com/b1chatbot/client/test.html",
                }],
            }]
        }
    }
};

exports.getProductUrl = function(encodedData){
    return exports.getUrl(exports.ViewProductUrl, encodedData);
}

exports.getUrl = function (url,encodedData) {
    return `${url}${encodedData}`;
}

exports.getItemSimilarityUrl = function()
{
    return `${exports.smbmkt_root_url}${exports.smbmkt_similarity_endpoint}`;    
}
