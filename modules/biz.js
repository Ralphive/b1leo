/* Biz Logic Functions */
module.exports = {
    MessagePriority: function (classification) {
        return (MessagePriority(classification));
    },
    MessageDetails: function (classification) {
        return (MessageDetails(classification));
    }
}

function MessagePriority(classification){
    if (classification == "complaint")
        return "pr_High";
    return "pr_Normal";
}

function MessageDetails(classification){
    var details = "";
    if (classification == "complaint")
        details = "URGENT "
    details +=  classification.toUpperCase(); + " from customer";
    return details;
}
