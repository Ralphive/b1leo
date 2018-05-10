const config = require("./config");
const util   = require('./util');

exports.ImageSimilarityAPIResult = [{
    "ItemCode": "A10000",
    "ItemDescription": "Rakuten",
    "UnitPrice": 1200.50,
    "Currency": "USD",
    "InStock": 12,
    "ImageUrl": "https://r.r10s.jp/com/global/en/img/gtop/shoes/Category-1.jpg"
}, {
    "ItemCode": "A20000",
    "ItemDescription": "Ellyn",
    "UnitPrice": 1899,
    "Currency": "USD",
    "InStock": 10,
    "ImageUrl": "https://riverisland.scene7.com/is/image/RiverIsland/703250_back?wid=1200"
}, {
    "ItemCode": "A30000",
    "ItemDescription": "BYRON",
    "UnitPrice": 3499,
    "Currency": "USD",
    "InStock": 1,
    "ImageUrl": "https://s3-ap-southeast-2.amazonaws.com/bettss3/images/003cys403_w600_h600.jpg"
}, {
    "ItemCode": "A40000",
    "ItemDescription": "Pigalle 100 Flamenco Leather",
    "Currency": "USD",
    "UnitPrice": 6999,
    "InStock": 0,
    "ImageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl196-joFAGjI3v9wpnRQOqesW3YmWKJHcLWbWuTWOxt2EwCO2"
}];

exports.FormatElments = function(result)
{
    let elements = [];
    result.forEach(e => {
        let entry =  JSON.parse(config.ElementTemplate);
        entry.title = e.ItemCode;
        entry.subtitle = 
`${e.ItemDescription}
Price: ${e.UnitPrice}${e.Currency}
In Stock: ${e.InStock}`;

        let data = {};
        data.selectedProduct = e,
        data.similarProducts = result;
        let productUrl = config.getProductUrl(util.encodeData(data));

        entry.image_url = e.ImageUrl;
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
    return config.getProductUrl(util.encodeData(data));
}

