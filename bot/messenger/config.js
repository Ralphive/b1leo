exports.default_smbmkt_root_url =  'https://smbmkt.cfapps.eu10.hana.ondemand.com';
exports.smbmkt_similarity_endpoint = 'SimilarItems';
//default smbmkt_bot_root_url, which will be reset on the fly.
exports.smbmkt_bot_root_url = 'https://sap-smbassistantbot.cfapps.eu10.hana.ondemand.com'
exports.ViewProductUrl = `${exports.smbmkt_bot_root_url}/web/Products?data=`;
exports.RefreshBotUrl = true;
exports.Decimal = 2;
exports.FbMaxNoInList = 4;
exports.EnableFbNlp = true;
exports.NlpConfidenceThreshhold = 0.80;
exports.AccessToken = 'To-Be-Updated: Place the page access token for your own messenger app here';
exports.VERIFY_TOKEN = 'To-Be-Updated: Place the verify token for your own messenger app here';
exports.Port = 1338;


const TO_UPDATE_PLACE_HOLDER = 'To-Be-Updated';

exports.CheckEnvVariable = function(evName) {
    let ev = process.env[evName];

    if((typeof(ev) === 'undefined') || (ev && ev.includes(TO_UPDATE_PLACE_HOLDER)))
    {
        console.error(`Mandatory enviorment variable ${evName} is not configured.`);
        return false;
    }
    return true;
};

//Mandatory configurations for the SMB Market Place Assistant Bot, which could be configured
//in manifest.yml or on the fly commands below:
//On Cloud Foundry:
//Option 1: Configure the variable in manifest.yml 
//Option 2: $cf set-env SMBMKT_BACKEND_URL <YOUR_SMBMKT_BACKEND_URL>
//On-Premise: 
//Bash: $export SMBMKT_BACKEND_URL <YOUR_SMBMKT_BACKEND_URL>
//Csh:  $set-env SMBMKT_BACKEND_URL <YOUR_SMBMKT_BACKEND_URL>
const MandatoryEnvVarList = ["SMBMKT_BACKEND_URL","VERIFY_TOKEN", "PAGE_ACCESS_TOKEN" ];

exports.CheckConfiguration = function() {
    //if detector is enabeld, will also check IMAGE_PRE_PROCESS_URL
    if(process.env.ENABLE_DETECTOR 
    && MandatoryEnvVarList.includes("DETECTOR_URL") === false)
    {
        MandatoryEnvVarList.push("DETECTOR_URL");
    }

    let length = MandatoryEnvVarList.length;
    let result = true;
    for(let i = 0; i < length; i++) {
        result = exports.CheckEnvVariable(MandatoryEnvVarList[i]) && result;
    }
    
    return result;
}

exports.Detectors = [
    {
        "Detector": "yolo",
        "ImagePreProcessUrl": "https://shoe-detector-yolo.cfapps.eu10.hana.ondemand.com/ImagePreprocess"
    },
    {
        "Detector": "tensorflow",
        "ImagePreProcessUrl": "https://shoe-detector-tf.cfapps.eu10.hana.ondemand.com/ImagePreprocess"
    }
];

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
    let smbRootUrl = process.env.SMBMKT_BACKEND_URL;
    //SMBMKT_BACKEND_URL has been not configured properly
    if((typeof smbRootUrl === 'undefinded') || (smbRootUrl && smbRootUrl.includes('To-Be-Updated') === true)) {
        console.log('mandatory environment variable SMBMKT_BACKEND_URL is missing. Point to the default one');
        smbRootUrl = exports.default_smbmkt_root_url;
    }
    return `${smbRootUrl}/${exports.smbmkt_similarity_endpoint}`;
}

exports.getFbUserLocationUrl = function(user_id)
{
    return `https://graph.facebook.com/${user_id}?fields=location&access_token=${exports.AccessToken}`;    
}

exports.getImagePreprocessUrl = function(detector)
{
    let detector_url = process.env.DETECTOR_URL;
    //Priority#1: Get the Image Preprocess endpoint from the enviroment variable.
    //if the environemnt varibale DETECTOR_URL has been configuredin manifest.yml or on the fly.
    if(detector_url && detector_url.includes('To-Be-Updated') === false )
    {
        return `${detector_url}/ImagePreprocess`;
    }

    //Priority#2: Get the Image Preprocess endpoint from the preconfigured exports.Detectors in code.
    for(let i = 0; i < exports.Detectors.length; i++) {
        let entry = exports.Detectors[i];
        if(entry.Detector === detector)
            return entry.ImagePreProcessUrl;
    }
    //Priority#3: default image pre preprocess serivce as tensorflow
    return exports.Detectors[1].ImagePreProcessUrl;
}