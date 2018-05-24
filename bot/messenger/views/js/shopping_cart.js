/* Set rates + misc */
$(document).ready(function () {
    var taxRate = 0.05;
    var shippingRate = 15.00;
    var fadeTime = 300;
    localStorage.products = localStorage.products ? localStorage.products : '[]';
    let products = JSON.parse(localStorage.products);

    //load the shopping cart from localstorage or db???
    products.forEach(element => {
        let lineTotal = element.quantity * element.price;
        $('#productList').append(`<div class="product">
    <div class="product-image">
        <img src="${element.image}">
    </div>
    <div class="product-details">
        <div class="product-title">${element.id}</div>
        <p class="product-description">${element.name}</p>
    </div>
    <div class="product-price">${element.price.toFixed(2)}</div>
    <div class="product-quantity">
        <input type="number" data-id="${element.id}" value="${element.quantity}" min="1">
    </div>
    <div class="product-removal">
        <button class="remove-product" data-id="${element.id}">
            Remove
        </button>
    </div>
    <div class="product-line-price">${lineTotal.toFixed(2)}</div>
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

    $('#checkout').click(function () {
        checkout(products);
        $('#productList').empty();
        recalculateCart();
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
        let id = quantityInput.dataset.id;

        for(let i = 0; i < products.length; i ++)
        {
            if(products[i].id === id)
            {
                console.log(`quantity of ${id} udpated as ${quantity}`);
                products[i].quantity = quantity;
                break;
            }
        }

        localStorage.products = JSON.stringify(products);
        /* Update line price display and recalc cart totals */
        productRow.children('.product-line-price').each(function () {
            $(this).fadeOut(fadeTime, function () {
                $(this).text(linePrice.toFixed(2));
                recalculateCart();
                $(this).fadeIn(fadeTime);
            });
        });
    }

    function removeProductById(productList, id) {
        for (let i = 0; i < productList.length; i++) {
            if (productList[i].id === id) {
                productList.splice(i, 1);
                console.log(`product-${id} removed`);
                return;
            }
        }
    }
    /* Remove item from cart */
    function removeItem(removeButton) {
        /* Remove row from DOM and recalc cart total */
        var productRow = $(removeButton).parent().parent();
        productRow.slideUp(fadeTime, function () {
            productRow.remove();
            
            let id = removeButton.dataset.id;
            removeProductById(products, id);
            localStorage.products = JSON.stringify(products);
            
            recalculateCart();
        });
    }
});