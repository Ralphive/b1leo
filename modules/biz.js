/**
 * Biz Logic functions 
 * this module is a "Middleware" to talk with multiple backend systems
 * it also normalizes and combine the different data structures from B1 and ByD
 * so the output data has a standard b1 format.
 */

const b1 = require("./erp/b1")
const byd = require("./erp/byd")
const normalize = require("./normalize")


module.exports = {
    GetItems: function (query, callback) {
        return (GetItems(query, callback))
    },
    GetSalesOrders: function (options, callback) {
        return (GetSalesOrders(options, callback))
    },
}

function GetItems(query, callback) {
    byd.GetItems(query, function (error, itemsByD) {
        if (error){
            itemsByD = {};
            itemsByD.error = error;
        }
        b1.GetItems(query, function (error, itemsB1) {
            if (error){
                itemsB1 = {};
                itemsB1.error = error;
            }

            var output = {
                b1:  {values: itemsB1.error  || itemsB1.value},
                byd: {values: itemsByD.error || itemsByD.d.results}
            }

            if(itemsB1.hasOwnProperty("odata.nextLink")){
                output.b1["odata.nextLink"] = itemsB1["odata.nextLink"];
            }
            callback(null, normalize.Items(output))
        })

    })
}

function GetSalesOrders(query, callback) {
    byd.GetSalesOrders(query, function (error, itemsByD) {
        b1.GetOrders(query, function (error, itemsB1) {
            var output = {
                b1: itemsB1.value,
                byd: itemsByD.d.results
            }
            callback(null, normalize.SalesOrders(output))
        })

    })
}

function LoadVectorDB(){
    //** Load all existent items and store them in the database */



}

function MessagePriority(classification) {
    /* Set activity priority based on Leonardo Classification */
    if (classification == "complaint")
        return "pr_High";
    return "pr_Normal";
}

function MessageDetails(classification) {
    /* Set activity details based on Leonardo Classification */
    var details = "";
    if (classification == "complaint")
        details = "URGENT ";
    details += classification.toUpperCase() + " from customer";
    return details;
}

function RequireMessage(priority) {
    /* Priorities of activities which requires a Message to be dispatched */
    if (priority == "pr_High")
        return true;
    return false;
}

function FormatMessage(activity) {
    return ({
        MessageDataColumns: [
            {
                ColumnName: "Activity",
                Link: "tYES",
                MessageDataLines: [
                    {
                        Object: "33", // Activities
                        ObjectKey: activity.ActivityCode,
                        Value: "Activity #" + activity.ActivityCode,
                    }
                ]
            }
        ],
        RecipientCollection: [
            {
                SendInternal: "tYES",
                UserCode: process.env.B1_USER_ENV
            }
        ],
        Subject: activity.Details,
        Text: activity.Details,
    });

}