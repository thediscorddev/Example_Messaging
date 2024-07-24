function addNewConversation(id, id2, is_target) {
if(is_target==true) {
    $.get("/getaccountdata?id="+id, function(datas) {
        var tmp = datas.data.username;
        if(tmp.length > 18) tmp = tmp.slice(0,15) + "..."; 
        $("#contact").prepend("<a class='fakeclickable' id='" + id + "'>" + 
        escapeHTML(tmp) + "<br>" + 
        "<p>This user just created this</p><br> <h6>Just created</h6></a>");
    });
}else {
    $.get("/getaccountdata?id="+id2, function(datas) {
        var tmp = datas.data.username;
        if(tmp.length > 18) tmp = tmp.slice(0,15) + "..."; 
        $("#contact").prepend("<a class='fakeclickable' id='" + id2 + "'>" + 
        escapeHTML(tmp) + "<br>" + 
        "<p>You just created this</p><br> <h6>Just created</h6></a>");
    });
}
}
function reloadcontact(content,time,id,id2,is_received) {
    var msg = content;
    if(msg.length > 18) msg= msg.slice(0,15)+"...";
    if(is_received==true) {
        $.get("/getaccountdata?id="+id, function(datas) {
            var tmp = datas.data.username;
            if(tmp.length > 18) tmp = tmp.slice(0,15) + "..."; 
            $("#"+id).remove();
            if(window.conid == id) {
                $("#contact").prepend("<a class='fakeclickable_selected' id='" + id + "'>" + 
                    escapeHTML(tmp) + "<br>" + 
                    "Them: <p>" + 
                    escapeHTML(msg) + 
                    "</p><br> <h6>" + 
                    timeSince(time) + " ago</h6></a>");
            }else {
            $("#contact").prepend("<a class='fakeclickable' id='" + id + "'>" + 
            escapeHTML(tmp) + "<br>" + 
            "Them: <p>" + 
            escapeHTML(msg) + 
            "</p><br> <h6>" + 
            timeSince(time) + " ago</h6></a>");
            const audio = new Audio("notify.mp3");
            audio.play();
            }
        });
    }else {
        $.get("/getaccountdata?id="+id2, function(datas) {
            var tmp = datas.data.username;
            if(tmp.length > 18) tmp = tmp.slice(0,15) + "..."; 
            $("#"+id2).remove();
            if(window.conid==id2) {
                $("#contact").prepend("<a class='fakeclickable_selected' id='" + id2 + "'>" + 
                    escapeHTML(tmp) + "<br>" + 
                    "You: <p>" + 
                    escapeHTML(msg) + 
                    "</p><br> <h6>" + 
                    timeSince(time) + " ago</h6></a>");
            }else
            $("#contact").prepend("<a class='fakeclickable' id='" + id2 + "'>" + 
            escapeHTML(tmp) + "<br>" + 
            "You: <p>" + 
            escapeHTML(msg) + 
            "</p><br> <h6>" + 
            timeSince(time) + " ago</h6></a>");
        });
    }
}
$(document).ready(function() {
    $.get("/getallconversation", function(data) {
        $("#contact").empty();
        if(data.data.length == 0) $("#contact").append("No Conversation found:(");
        else {
            var t = data.data;
            t.sort(function(a,b) {
                return b.time-a.time;
            })
            for(const obj of t) {
                //alert("<a href=conversation.html?id="+obj.id+">"+obj.username+"<br>"+obj.isfromuser+": "+obj.latest_message+"</a><br><br><br>")
                if(parseInt(obj.id) != NaN) $.get("/getaccountdata?id="+obj.id, function(datas) {
                    var tmp = datas.data.username;
                    if(tmp.length > 18) tmp = tmp.slice(0,15) + "..."; 
                    if(window.conid) {
                        if(obj.id == window.conid) {
                            $("#contact").append("<a class='fakeclickable_selected' id='" + obj.id + "'>" + 
                                escapeHTML(tmp) + "<br>" + 
                                obj.isfromuser + ": <p>" + 
                                escapeHTML(obj.latest_message) + 
                                "</p><br> <h6>" + 
                                timeSince(obj.time) + " ago</h6></a>");
          
                        }else {
                            $("#contact").append("<a class='fakeclickable' id='" + obj.id + "'>" + 
                                escapeHTML(tmp) + "<br>" + 
                                obj.isfromuser + ": <p>" + 
                                escapeHTML(obj.latest_message) + 
                                "</p><br> <h6>" + 
                                timeSince(obj.time) + " ago</h6></a>");
                        }
                    }else {
                        $("#contact").append("<a class='fakeclickable' id='" + obj.id + "'>" + 
                            escapeHTML(tmp) + "<br>" + 
                            obj.isfromuser + ": <p>" + 
                            escapeHTML(obj.latest_message) + 
                            "</p><br> <h6>" + 
                            timeSince(obj.time) + " ago</h6></a>");
                    }
  
                })
            }
        }
        setInterval(function() {
            $.get("/getallconversation", function(data) {
                $("#contact").empty();
                if(data.data.length == 0) $("#contact").append("No Conversation found:(");
                else {
                    var t = data.data;
                    t.sort(function(a,b) {
                        return b.time-a.time;
                    })
                    for(const obj of t) {
                        //alert("<a href=conversation.html?id="+obj.id+">"+obj.username+"<br>"+obj.isfromuser+": "+obj.latest_message+"</a><br><br><br>")
                        if(parseInt(obj.id) != NaN) $.get("/getaccountdata?id="+obj.id, function(datas) {
                            var tmp = datas.data.username;
                            if(tmp.length > 18) tmp = tmp.slice(0,15) + "..."; 
                            if(window.conid) {
                                if(obj.id == window.conid) {
                                    $("#contact").append("<a class='fakeclickable_selected' id='" + obj.id + "'>" + 
                                        escapeHTML(tmp) + "<br>" + 
                                        obj.isfromuser + ": <p>" + 
                                        escapeHTML(obj.latest_message) + 
                                        "</p><br> <h6>" + 
                                        timeSince(obj.time) + " ago</h6></a>");
                  
                                }else {
                                    $("#contact").append("<a class='fakeclickable' id='" + obj.id + "'>" + 
                                        escapeHTML(tmp) + "<br>" + 
                                        obj.isfromuser + ": <p>" + 
                                        escapeHTML(obj.latest_message) + 
                                        "</p><br> <h6>" + 
                                        timeSince(obj.time) + " ago</h6></a>");
                                }
                            }else {
                                $("#contact").append("<a class='fakeclickable' id='" + obj.id + "'>" + 
                                    escapeHTML(tmp) + "<br>" + 
                                    obj.isfromuser + ": <p>" + 
                                    escapeHTML(obj.latest_message) + 
                                    "</p><br> <h6>" + 
                                    timeSince(obj.time) + " ago</h6></a>");
                            }
          
                        })
                    }
                }
            });
        },"60000");
    });
})