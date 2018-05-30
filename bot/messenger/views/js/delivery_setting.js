$(document).ready(function () {
    var $form = $('#delivery-setting-form');
    $form.find('.save').on('click', save);
    initiate();

    function initiate() {
        if (typeof localStorage.DeliverySetting === 'undefined') {
            localStorage.DeliverySetting = '{}';
            return;
        };

        try {
            let DeliverySetting = JSON.parse(localStorage.DeliverySetting);
            if (DeliverySetting) {
                if (DeliverySetting.Line1)
                    $("#line1").val(DeliverySetting.Line1);
                if (DeliverySetting.Line2)
                    $("#line2").val(DeliverySetting.Line2);
                if (DeliverySetting.City)
                    $("#city").val(DeliverySetting.City);
                if (DeliverySetting.State)
                    $("#state").val(DeliverySetting.State);
                if (DeliverySetting.PostCode)
                    $("#postCode").val(DeliverySetting.PostCode);
                if (DeliverySetting.Country)
                    $("#country").val(DeliverySetting.Country);
            }
        } catch (error) {
            console.error(error);
        }

    }

    function save(e) {
        e.preventDefault();
        console.log('DeliverySetting.Save()');
        /* Abort if invalid form data */
        if (!validator.form()) {
            console.log('Invalid Payment Method');
            $('#operationFailureModal').modal('show');
            return;
        }

        //Security issue: just for demo. 
        //You should have store the payment setting securely instead of local storage
        let DeliverySetting = {};
        DeliverySetting.Line1 = $("#line1").val();
        DeliverySetting.Line2 = $("#line2").val();
        DeliverySetting.City = $("#city").val();
        DeliverySetting.State = $("#state").val();
        DeliverySetting.PostCode = $("#postCode").val();
        DeliverySetting.Country = $("#country").val();

        localStorage.DeliverySetting = JSON.stringify(DeliverySetting);

        $('#operationSuccessModal').modal('show');
        /* Visual feedback */
        //$form.find('.save').html('Validating <i class="fa fa-spinner fa-pulse"></i>').prop('disabled', true);
    }

    /* Form validation using Stripe client-side validation helpers */
    // jQuery.validator.addMethod("validateLine1", function (value, element) {
    //     return value.trim().length > 0;
    // }, "Please specify address line 1.");

    // jQuery.validator.addMethod("validateCity", function (value, element) {
    //     return  value.trim().length > 0;
    // }, "Please enter city.");

    // jQuery.validator.addMethod("validateState", function (value, element) {
    //     return  value.trim().length > 0;
    // }, "Please enter state.");

    // jQuery.validator.addMethod("validatePostCode", function (value, element) {
    //     return  value.trim().length > 0;
    // }, "Please enter post code.");

    // jQuery.validator.addMethod("validateCountry", function (value, element) {
    //     return  value.trim().length > 0;
    // }, "Please enter country.");

    let validator = $form.validate({
        rules: {
            line1: {
                required: true,
                normalizer: function(value) {
                    return $.trim(value);
                }
            },
            city: {
                required: true,
                normalizer: function(value) {
                    return $.trim(value);
                }
            },
            state: {
                required: true,
                normalizer: function(value) {
                    return $.trim(value);
                }
            },
            postCode: {
                required: true,
                normalizer: function(value) {
                    return $.trim(value);
                }
            },
            country: {
                required: true,
                normalizer: function(value) {
                    return $.trim(value);
                }
            }
        },
        messages: {
            line1: "Please enter address line 1.",
            city: "Please enter city.",
            state: "Please enter state.",
            postCode: "Please enter post code.",
            country: "Please enter country."
        },
        highlight: function (element) {
            $(element).closest('.form-control').removeClass('success').addClass('error');
        },
        unhighlight: function (element) {
            $(element).closest('.form-control').removeClass('error').addClass('success');
        },
        // errorPlacement: function (error, element) {
        //     $(element).closest('.form-group').append(error);
        // }
    });

    delSettingFormReady = function () {
        //return true;
        if ($form.find('[name=line1]').hasClass("success") &&
            $form.find('[name=city').hasClass("success") &&
            $form.find('[name=state]').val().length > 1) {
            return true;
        } else {
            return false;
        }
    }

    // $form.find('.save').prop('disabled', true);
    // var readyInterval = setInterval(function () {
    //     if (delSettingFormReady()) {
    //         $form.find('.save').prop('disabled', false);
    //         clearInterval(readyInterval);
    //     }
    // }, 250);
});