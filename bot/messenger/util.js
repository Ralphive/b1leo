exports.random = function (max)
{
    return Math.floor((Math.random() * max));
};

exports.encodeData = function(testData) {
    let result = Buffer.from(JSON.stringify(testData)).toString('base64'); //btoa(JSON.stringify(testData)); 
    return result;
};