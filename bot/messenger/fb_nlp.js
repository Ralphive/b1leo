const config = require('./config');
const generalIntents = require('./GeneralIntents');
let util = require('./util');

//{"mid":"mid.$cAAdmRuuSPSlmXPALqVgK6rDIJujD","seq":3149,"text":"hello",
//"nlp":{"entities":{"greetings":[{"confidence":0.99988770484656,"value":"true","_entity":"greetings"}]}}}
exports.getNlpEntity = function(nlp, name, index) {
    if (nlp && nlp.entities) {
        if (nlp.entities.hasOwnProperty(name) && nlp.entities[name][index].confidence >= config.NlpConfidenceThreshhold) {
            return nlp.entities[name][index].value;
        }
    }
    return null;
}

exports.getNlpFirstEntity = function(nlp, name) {
    return exports.getNlpEntity(nlp, name, 0);
}

exports.getNlpIntent = function (nlp, index) {
    return nlp && nlp.entities && nlp.entities.intent && nlp.entities.intent[index];
}

/**
 * Get the intent name by index, only if the intent exist and the confidence of NLP surpass the confidence threshhold
 */
exports.getNlpIntentName = function (nlp, index) {
    let intent = exports.getNlpIntent(nlp, index);

    if(intent && intent.confidence && intent.confidence >= config.NlpConfidenceThreshhold)
        return intent.value;

    return null;
}

exports.getFirstNlpIntentName = function (nlp, index) {
    return exports.getNlpIntentName(nlp, 0);
}

/**
 * {"mid":"mid.$cAAdmRuuSPSlmX98gTVgLpnbvDCrd","seq":3199,"text":"check customer c20000",
 * "nlp":{"entities":{"customer_code":[{"confidence":0.9882424805545,"value":"C20000","type":"value",
 * "_entity":"customer_code","_body":"c20000","_start":15,"_end":21}],
 * "intent":[{"confidence":0.99868931773592,"value":"ShowCustomer","_entity":"intent"}]}}}
 * @param {*} nlp 
 * @param {*} name 
 */
exports.getNlpFirstIntent = function (nlp) {
    return exports.getNlpIntentName(nlp, 0);
}

exports.GeneralIntentReply = function(targetIntent){
    let reply;
     generalIntents.forEach(element =>{
        if(element.intent === targetIntent)
        {
            let count = element.replies.length;
            reply = element.replies[util.random(count)];
            console.log(reply);
            return reply;
        }
    });

    return reply;
}