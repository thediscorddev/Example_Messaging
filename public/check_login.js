$(document).ready(function () {
    $.get("/gettoken", function(data) {
        if(data == "null")  window.location.href = window.location.origin + "/unauth.html";
    })
});