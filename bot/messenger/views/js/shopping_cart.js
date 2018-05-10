/* Set rates + misc */
$(document).ready(function () {
    var taxRate = 0.05;
    var shippingRate = 15.00;
    var fadeTime = 300;
    localStorage.products = localStorage.products?localStorage.products:'[]';
    let products = JSON.parse(localStorage.products);


    var ImageSimilarityAPIResult = [{
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

    //load the shopping cart from localstorage or db???
    /* ImageSimilarityAPIResult.forEach(element => {
        $('#productList').append(`<div class="product">
    <div class="product-image">
        <img src="${element.ImageUrl}">
    </div>
    <div class="product-details">
        <div class="product-title">${element.ItemCode}</div>
        <p class="product-description">${element.ItemDescription}</p>
    </div>
    <div class="product-price">${element.UnitPrice}</div>
    <div class="product-quantity">
        <input type="number" value="1" min="1">
    </div>
    <div class="product-removal">
        <button class="remove-product">
            Remove
        </button>
    </div>
    <div class="product-line-price">${element.UnitPrice}</div>
</div>`);
    }); */

    products.forEach(element => {
        let lineTotal = element.quantity * element.price;
        $('#productList').append(`<div class="product">
    <div class="product-image">
        <img src="${element.image}">
    </div>
    <div class="product-details">
        <div class="product-title">${element.name}</div>
        <p class="product-description">${element.summary}</p>
    </div>
    <div class="product-price">${element.price}</div>
    <div class="product-quantity">
        <input type="number" value="${element.quantity}" min="1">
    </div>
    <div class="product-removal">
        <button class="remove-product">
            Remove
        </button>
    </div>
    <div class="product-line-price">${lineTotal}</div>
</div>`);
    });
    recalculateCart();
    
    /* Assign actions */
    $('.product-quantity input').change(function () {
        updateQuantity(this);
    });

    $('.product-removal button').click(function () {
        removeItem(this);
    });

    /* Recalculate cart */
    function recalculateCart() {
        var subtotal = 0;

        /* Sum up row totals */
        $('.product').each(function () {
            subtotal += parseFloat($(this).children('.product-line-price').text());
        });

        /* Calculate totals */
        var tax = subtotal * taxRate;
        var shipping = (subtotal > 0 ? shippingRate : 0);
        var total = subtotal + tax + shipping;

        /* Update totals display */
        $('.totals-value').fadeOut(fadeTime, function () {
            $('#cart-subtotal').html(subtotal.toFixed(2));
            $('#cart-tax').html(tax.toFixed(2));
            $('#cart-shipping').html(shipping.toFixed(2));
            $('#cart-total').html(total.toFixed(2));
            if (total == 0) {
                $('.checkout').fadeOut(fadeTime);
            } else {
                $('.checkout').fadeIn(fadeTime);
            }
            $('.totals-value').fadeIn(fadeTime);
        });
    }

    


    /* Update quantity */
    function updateQuantity(quantityInput) {
        /* Calculate line price */
        var productRow = $(quantityInput).parent().parent();
        var price = parseFloat(productRow.children('.product-price').text());
        var quantity = $(quantityInput).val();
        var linePrice = price * quantity;

        /* Update line price display and recalc cart totals */
        productRow.children('.product-line-price').each(function () {
            $(this).fadeOut(fadeTime, function () {
                $(this).text(linePrice.toFixed(2));
                recalculateCart();
                $(this).fadeIn(fadeTime);
            });
        });
    }


    /* Remove item from cart */
    function removeItem(removeButton) {
        /* Remove row from DOM and recalc cart total */
        var productRow = $(removeButton).parent().parent();
        productRow.slideUp(fadeTime, function () {
            productRow.remove();
            recalculateCart();
        });
    }
});