var accessToken = "f5c36cec32f64f61a0fdf426d25fce51",
    investApiKey = "YTG3TTH2PRUNCIVQ",
    baseUrl = "https://api.api.ai/v1/",
    $input

$(document).ready(function() {
    $input = $("#input");
    $recBtn = $("#rec");
    $input.keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            send();
        }
    });
    $recBtn.on("click", function(event) {
        send();
    });
    $(".debug__btn").on("click", function() {
        $(this).next().toggleClass("is-active");
        return false;
    });
});

function updateRec() {
    $recBtn.text(recognition ? "Stop" : "Speak");
}

function send() {
    var text = $input.val();
    $("#spokenResponse").addClass("is-active").find(".spoken-response__text").append("[User]: " + text + "\n");
    $("#logo").css("opacity", 0);
    if (text == "") {
        respond("", "Please type something...");
        return;
    }
    $.ajax({
        type: "POST",
        url: baseUrl + "query",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
        data: JSON.stringify({ query: text, lang: "en", sessionId: "yaydevdiner" }),
        success: function(data) {
            prepareResponse(data);
        },
        error: function() {
            respond("", "An Error has Occurred.");
        }
    });
}

function prepareResponse(val) {
    var debugJSON = JSON.stringify(val, undefined, 2);
    debugRespond(debugJSON);
    callAPI(val);
}

function isEmpty(object) { for (var i in object) { return true; } return false; }

function callAPI(val) {
    console.log(val);
    if (Object.getOwnPropertyNames(val).length == 0) {
        respond("", "Please Type Something...");
        return;
    }
    if (Object.getOwnPropertyNames(val.result.parameters).length == 0) {
        respond("", val.result.speech);
        return;
    }
    if (val.result.parameters.symbol == "") {
        respond("", val.result.speech);
        return;
    }
    var params = val.result.parameters.params;
    var arr = params.split(',');
    var urlExt = "";
    for (var i = 0; i < arr.length; i++) {
        urlExt += "&" + arr[i] + "=" + val.result.parameters[arr[i]];
    }
    urlExt = urlExt.substring(1);
    var location = val.result.parameters.location;
    var URL = "https://www.alphavantage.co/query?" + urlExt + "&apikey=" + investApiKey
    var apiData;
    $.get(URL, function(data, status) {
        arr = location.split(',');
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][0] == '#') {
                if (val.result.parameters[arr[i].substring(1)] != null) {
                    if (data[val.result.parameters[arr[i].substring(1)]] == undefined) {
                        data = data[Object.keys(data)[0]];
                    } else {
                        data = data[val.result.parameters[arr[i].substring(1)]];
                    }
                } else {
                    //Is null, go first
                    data = data[Object.keys(data)[0]];
                }
            } else {
                if (data[arr[i]] == undefined) {
                    data = data[Object.keys(data)[0]];
                } else {
                    data = data[arr[i]];
                }
            }
        }
        apiData = JSON.stringify(data, undefined, 2);
        respond(apiData, val.result.speech);
    });
}

function debugRespond(val) {
    $("#response").text(val);
}

function respond(response, template) {
    if (response == "") {
        response = "Please type something...";
    }
    $("#spokenResponse").addClass("is-active").find(".spoken-response__text").append("[Investerbot]: " + template.replace("$output", response.replace('"', "$").replace('"', ".")) + "\n");
}