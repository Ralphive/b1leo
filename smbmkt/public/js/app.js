$(document).ready(function () {
    $("#testUrl").change(function () {
        readURL(this);
    });
    $('#Similar').on('click', function () {
        Process("/Similar", function (data) {
            DisplaySimilars(data.predictions);
        });
    });
});

function Process(endpoint, callback) {
    DisableButtons(true)
    EmptyResults();

    var body = {
        "url": $("#testUrl").val(),
        "similarItems": 40
    }

    postData("./SimilarItems", body, function (data) {
        DisplaySimilars(data)
    })
}

function DisplaySimilars(data) {
    console.dir(data.length)

    //Header
    $("#resultTable thead").append(
        "<tr>" +
        "<th>Origin</th>" +
        "<th>Product</th>" +
        "<th>Image</th>" +
        "<th>Score</th>" +
        "</tr>");

    for (erp in data) {
        for (item in data[erp]) {
            $("#resultTable tbody").append(
                "<tr>" +
                "<td>" + erp + "</td>" +
                "<td>" + data[erp][item].productid + "</td>" +

                "<td><a href='" + data[erp][item].image + "'><img src='" + data[erp][item].image + "' width='50' height='50'/></a></td>" +
                "<td>" + +data[erp][item].score + "</td>" +
                "</tr>");
        }
    }
    $("pre").append(JSON.stringify(data, null, 4))
    DisableButtons(false)

}


function readURL(input) {

    $('#blah').attr('src', input.value);


}

function DisableButtons(status) {
    $('#Similar').prop('disabled', status)
}

function EmptyResults() {
    $('pre').empty();
    $('.table thead').empty();
    $('.table tbody').empty();
}




function postData(endpoint, body, callback) {
    $.ajax({
        url: endpoint,
        type: 'POST',
        data: JSON.stringify(body),
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            return callback(data);
        },
        error: function (xhr, status, errorThrown) {
            alert(errorThrown);
            console.log("Error: " + errorThrown);
            console.log("Status: " + status);
            console.dir(xhr);
        },
    });

}

