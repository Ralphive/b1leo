$(document).ready(function () {
    var $form = $('#payment-setting-form');
    $form.find('.save').on('click', save);
    initiate();

    function initiate() {
        if (typeof localStorage.PaymentSetting === 'undefined') {
            localStorage.PaymentSetting = '{}';
            return;
        };

        try {
            let PaymentSetting = JSON.parse(localStorage.PaymentSetting);
            if (PaymentSetting) {
                if (PaymentSetting.CardNumber)
                    $("#cardNumber").val(PaymentSetting.CardNumber);
                if (PaymentSetting.Expiration)
                    $("#cardExpiry").val(PaymentSetting.Expiration);
                if (PaymentSetting.CardCVC)
                    $("#cardCVC").val(PaymentSetting.CardCVC);
            }
        } catch (error) {
            console.error(error);
        }

    }

    function save(e) {
        e.preventDefault();
        console.log('PaymentSetting.Save()');
        /* Abort if invalid form data */
        if (!validator.form()) {
            console.log('Invalid Payment Method');
            $('#operationFailureModal').modal('show');
            return;
        }

        //Security issue: just for demo. 
        //You should have store the payment setting securely instead of local storage
        let PaymentSetting = {};
        PaymentSetting.CardNumber = $("#cardNumber").val();
        PaymentSetting.Expiration = $("#cardExpiry").val();
        PaymentSetting.CardCVC = $("#cardCVC").val();

        localStorage.PaymentSetting = JSON.stringify(PaymentSetting);

        $('#operationSuccessModal').modal('show');
        /* Visual feedback */
        //$form.find('.save').html('Validating <i class="fa fa-spinner fa-pulse"></i>').prop('disabled', true);
    }

    function payWithStripe(e) {
        e.preventDefault();

        /* Abort if invalid form data */
        if (!validator.form()) {
            return;
        }

        /* Visual feedback */
        $form.find('.save').html('Validating <i class="fa fa-spinner fa-pulse"></i>').prop('disabled', true);

        var PublishableKey = 'pk_test_6pRNASCoBOKtIshFeQd4XMUh'; // Replace with your API publishable key
        Stripe.setPublishableKey(PublishableKey);

        /* Create token */
        var expiry = $form.find('[name=cardExpiry]').payment('cardExpiryVal');
        var ccData = {
            number: $form.find('[name=cardNumber]').val().replace(/\s/g, ''),
            cvc: $form.find('[name=cardCVC]').val(),
            exp_month: expiry.month,
            exp_year: expiry.year
        };

        Stripe.card.createToken(ccData, function stripeResponseHandler(status, response) {
            if (response.error) {
                /* Visual feedback */
                $form.find('.save').html('Try again').prop('disabled', false);
                /* Show Stripe errors on the form */
                $form.find('.payment-errors').text(response.error.message);
                $form.find('.payment-errors').closest('.row').show();
            } else {
                /* Visual feedback */
                $form.find('.save').html('Processing <i class="fa fa-spinner fa-pulse"></i>');
                /* Hide Stripe errors on the form */
                $form.find('.payment-errors').closest('.row').hide();
                $form.find('.payment-errors').text("");
                // response contains id and card, which contains additional card details            
                console.log(response.id);
                console.log(response.card);
                var token = response.id;
                // AJAX - you would send 'token' to your server here.
                $.post('/account/stripe_card_token', {
                        token: token
                    })
                    // Assign handlers immediately after making the request,
                    .done(function (data, textStatus, jqXHR) {
                        $form.find('.save').html('Payment successful <i class="fa fa-check"></i>');
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        $form.find('.save').html('There was a problem').removeClass('success').addClass('error');
                        /* Show Stripe errors on the form */
                        $form.find('.payment-errors').text('Try refreshing the page and trying again.');
                        $form.find('.payment-errors').closest('.row').show();
                    });
            }
        });
    }

    /* Fancy restrictive input formatting via jQuery.payment library*/
    $('input[name=cardNumber]').payment('formatCardNumber');
    $('input[name=cardCVC]').payment('formatCardCVC');
    $('input[name=cardExpiry]').payment('formatCardExpiry');

    /* Form validation using Stripe client-side validation helpers */
    jQuery.validator.addMethod("cardNumber", function (value, element) {
        return this.optional(element)|| Stripe.card.validateCardNumber(value);
    }, "Please specify a valid credit card number.");

    jQuery.validator.addMethod("cardExpiry", function (value, element) {
        /* Parsing month/year uses jQuery.payment library */
        value = $.payment.cardExpiryVal(value);
        return this.optional(element) || Stripe.card.validateExpiry(value.month, value.year);
    }, "Invalid expiration date.");

    jQuery.validator.addMethod("cardCVC", function (value, element) {
        return this.optional(element) || Stripe.card.validateCVC(value);
    }, "Invalid CVC.");

    validator = $form.validate({
        rules: {
            cardNumber: {
                required: true,
                cardNumber: true
            },
            cardExpiry: {
                required: true,
                cardExpiry: true
            },
            cardCVC: {
                required: true,
                cardCVC: true
            }
        },
        highlight: function (element) {
            $(element).closest('.form-control').removeClass('success').addClass('error');
        },
        unhighlight: function (element) {
            $(element).closest('.form-control').removeClass('error').addClass('success');
        },
        errorPlacement: function (error, element) {
            $(element).closest('.form-group').append(error);
        }
    });

    paymentFormReady = function () {

        if ($form.find('[name=cardNumber]').hasClass("success") &&
            $form.find('[name=cardExpiry]').hasClass("success") &&
            $form.find('[name=cardCVC]').val().length > 1) {
            return true;
        } else {
            return false;
        }
    }

    //$form.find('.save').prop('disabled', true);
    // var readyInterval = setInterval(function () {
    //     if (paymentFormReady()) {
    //         $form.find('.save').prop('disabled', false);
    //         clearInterval(readyInterval);
    //     }
    // }, 250);
});