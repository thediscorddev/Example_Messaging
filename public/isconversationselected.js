$(document).ready(function() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('id');
    
    if (!code) {
        $("#main").append("<br><br>Please select a conversation to start!");
    } else {
        window.conid = code;
        $("#tiv").append('<button type="button" id="buttoned">Send</button>');

        $.get("/getaccountdata?id=" + code, function(data) {
            if (data.status != 200) {
                window.location.href = window.location.origin + "/404.html";
                return;
            }
            $("#targetname").html(escapeHTML(data.data.username) + " (" + data.data.id + ")");
        });
    }
});

function switch_convor(convorid) {
    $("#tiv").empty();
    $("#tiv").append('<input type="text" id="input" name="input" placeholder="Type here">');
    $("#tiv").append('<button type="button" id="buttoned">Send</button>');
    $("#main").empty();
    $("#main").html("<br><br>Loading...");
    $.get("/getaccountdata?id=" + convorid, function(data) {
        window.conid = convorid;
        if (data.status != 200) {
            window.location.href = window.location.origin + "/404.html";
            return;
        }
        $("#targetname").html(escapeHTML(data.data.username) + " (" + data.data.id + ")");
        reload();
    });
}
