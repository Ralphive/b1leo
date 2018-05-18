const config = require('./config');
exports.random = function (max)
{
    return Math.floor((Math.random() * max));
};

exports.encodeData = function(testData) {
    let result = Buffer.from(JSON.stringify(testData)).toString('base64'); //btoa(JSON.stringify(testData)); 
    return result;
};

exports.FormatElments = function(result)
{
    let elements = [];
    result.forEach(e => {
        let entry =  JSON.parse(config.ElementTemplate);
        entry.title = e.productid;
        entry.subtitle = 
`${e.name}
Price: ${e.price}${e.priceCurrency}
In Stock: ${e.inventoryLevel}`;

        let data = {};
        data.selectedProduct = e,
        data.similarProducts = result;
        let productUrl = config.getProductUrl(exports.encodeData(data));

        entry.image_url = e.ImageUrl;
        entry.default_action.url = productUrl;
        //entry.default_action.fallback_url = productUrl;

        entry.buttons[0].url = productUrl;
        //entry.buttons[0].fallback_url = productUrl;

        elements.push(entry);
    });

    return elements;
};

exports.Str2Fixed = function(str, decimal){
    return parseFloat(str).toFixed(decimal);
};

exports.Str2Fixed2 = function(str)
{
    return parseFloat(str).toFixed(config.Decimal);
};

exports.Str2Perc = function(str)
{
    let result = (parseFloat(str) * 100).toFixed(config.Decimal);
    //console.log(`str: ${str}. result: ${result}`);
    return `${result}%`;
};

exports.FormatItemResult = function(result){
        let b1_result = [];
        if(exports.CheckType(result.b1)
        && exports.CheckType(result.b1[0])
        && exports.CheckType(result.b1[0].productid)){
            b1_result = result.b1;
        }

        let byd_result = [];
        if(exports.CheckType(result.byd)
        && exports.CheckType(result.byd[0])
        && exports.CheckType(result.byd[0].productid)){
            byd_result = result.byd;
        }
            
        b1_result.forEach(element =>{
            element.source = 'b1';
            //element.score = exports.Str2Perc(element.score);
            element.score = parseFloat(element.score);
        });
    
        byd_result.forEach(element => {
            element.source = 'byd';
            //byd return very long decimal.
            element.price = exports.Str2Fixed2(element.price);
            element.score = parseFloat(element.score);
        })
    
        //sort the result by similarity score desc.
        let finalResult =  b1_result.concat(byd_result);
        finalResult.sort((a,b) => {
            return b.score - a.score;
        });

        //format the score to percentage
        finalResult.forEach(element => {
            element.score = exports.Str2Perc(element.score);
        });

        return finalResult;
};

exports.FormatElments2 = function(result)
{
    let elements = [];

    result.forEach(e => {
        let entry =  JSON.parse(config.ElementTemplate);
        entry.title = `${e.productid}(${e.score})`;
        //e.price = 100;
        //e.inventoryLevel = 10;
        e.priceCurrency ='$';
        entry.subtitle = 
`${e.name}
Price: ${e.price}${e.priceCurrency}
In Stock: ${e.inventoryLevel}`;

        let data = {};
        data.selectedProduct = e,
        data.similarProducts = result;
        let productUrl = config.getProductUrl(exports.encodeData(data));
        
        console.log(`add2chart url
${productUrl}`);
        entry.image_url = e.image;
        entry.default_action.url = productUrl;
        //entry.default_action.fallback_url = productUrl;

        entry.buttons[0].url = productUrl;
        //entry.buttons[0].fallback_url = productUrl;

        elements.push(entry);
    });

    return elements;
};

exports.BuildViewProductsUrl = function (result) {
    let data = {};
    data.selectedProduct = {},
    data.similarProducts = result;
    return config.getProductUrl(exports.encodeData(data));
};

exports.CheckType = function(jsObj) {
    return typeof jsObj !== 'undefined';
};
