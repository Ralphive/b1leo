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
exports.AccessToken = 'EAAC1crXKdJcBALxOvdCIjdCnoAkU2F9JVM2NR8WR8mqzS3EcxfW1V70cjBgWuFIYZCQUUuejBpKxUKiZC9ZAS4F0PZBnBZA7q4D0sUH2SA8gS80WxfXutOR1AzxgMvY8XHqQZCNGjhz0qBPjKqnhfcZBpApNPadhqnfXYSdRPklaAZDZD';
exports.VERIFY_TOKEN = "yatsea-SMBAssistantBot";
exports.Port = 1338;

exports.Detectors = [
    {
        "Detector": "yolo",
        "ImagePreProcessUrl": "https://shoe-detector-yolo.cfapps.eu10.hana.ondemand.com/ImagePreprocess"
    },
    {
        "Detector": "tensorflow",
        "ImagePreProcessUrl": "https://shoe-detector-tf.cfapps.eu10.hana.ondemand.com/ImagePreprocess"
    }
]

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
                "url": "https://sap-smbassistantbot.cfapps.eu10.hana.ondemand.com/web/Products?data="
            }],
        }
    }
};

exports.ElementTemplate = `{
    "title": "",
    "image_url": "",
    "subtitle": "",
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
                "image_url": "<Placeholder>",
                "buttons": [{
                    "type": "web_url",
                    "title": "View Detail",
                    "webview_height_ratio": "tall",
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

exports.getFbUserLocationUrl = function(user_id)
{
    return `https://graph.facebook.com/${user_id}?fields=location&access_token=${exports.AccessToken}`;    
}

exports.getImagePreprocessUrl = function(detector)
{
    for(let i = 0; i < exports.Detectors.length; i++) {
        let entry = exports.Detectors[i];
        if(entry.Detector === detector)
            return entry.ImagePreProcessUrl;
    }
    //default image preprocessor as tensorflow
    return exports.Detectors[1].ImagePreProcessUrl;
}