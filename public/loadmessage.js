function appendmessage(content,time,is_received)
{
    if(is_received == true) {
        var newDiv = $('<div class="target_message"><p>'+escapeHTML(content)+'</p><h6>'+timeSince(time)+' ago</h6></div><br><br><br><br><br><br><br><br><br><br>');
                    $("#main").append(newDiv);
    }else {
        var newDiv = $('<div class="your_message"><p>'+escapeHTML(content)+'</p><h6>'+timeSince(time)+' ago</h6></div><br><br><br><br><br><br><br><br><br><br>');
        $("#main").append(newDiv);
    }
}
function reload() {
    $.get("/get_conversation?id="+window.conid, function(data) {
        if(data.status != 200) window.location.href = window.location.origin + "/404.html";
        else {
            $.get("/get_conversation?id="+window.conid, function(data) {});
            $('#main').empty();
            $("#main").append("<br><br><br>");
            data.conversation.forEach(element => {
                if(element.id==window.conid) {
                    //target
                    var newDiv = $('<div class="target_message"><p>'+escapeHTML(element.content)+'</p><h6>'+timeSince(element.time)+' ago</h6></div><br><br><br><br><br><br><br><br><br><br>');
                    $("#main").append(newDiv);
                }else {
                    var newDiv = $('<div class="your_message"><p>'+escapeHTML(element.content)+'</p><h6>'+timeSince(element.time)+' ago</h6></div><br><br><br><br><br><br><br><br><br><br>');
                    $("#main").append(newDiv);
                }
                /* 
                    {
                    "id":value,
                    "content":value
                    }
                */
            });
        }
    })
}
$(document).ready(function() {
    if(window.conid) {
        reload();
        setInterval(reload,60000);
    }
});