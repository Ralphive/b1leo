/* functions to manipulate Odata */
module.exports = {
    formatQuery: function (query, select) {
        return (formatQuery(query, select))
    },
    formatResponse: function (body) {
        return (formatResponse(body))
    }
}

function formatQuery(query, select) {
    /* For security, only support some odata notations */
    
    qs = {}

    if (query.hasOwnProperty("$skip")) {
        qs["$skip"] = query["$skip"]
    }

    if (query.hasOwnProperty("$top")) {
        qs["$top"] = query["$top"]
    }else{
        qs["$top"] = 20
    }

    if(select){
        qs["$select"] = select;
    }

    return qs;

}

function formatResponse(body) {

    if (body.hasOwnProperty("odata.metadata")) {
        delete body["odata.metadata"];
    }

    if (body.hasOwnProperty("odata.nextLink")) {
        var nextLink = body["odata.nextLink"]
        body["odata.nextLink"] = nextLink.replace(process.env.B1_SLPATH_ENV, "");
    }
    return body;
}