const socket = new WebSocket('ws://localhost:3000');
socket.onopen = function(event) {
    console.log('Connection opened:', event);
};

socket.onmessage = function(event) {
    console.log('Message from server:', event.data);
    const data = JSON.parse(event.data);
    $.get("/getid", function(id) {
        if (id != "null") {
            if(data.data.id == id || data.data.destination == id) 
                {
    if(data.type == "new_message") {
                        if(window.conid == data.data.id || window.conid == data.data.destination) {
                            appendmessage(data.data.content,data.data.time,data.data.destination==id);
                        }
                        reloadcontact(data.data.content,data.data.time,data.data.id,data.data.destination,data.data.destination==id);
                    
            
        
    }else if(data.type=="new_conversation") {
        addNewConversation(data.data.id,data.data.destination,data.data.destination==id);
    
    }
                }
    }
});
};

socket.onclose = function(event) {
    console.log('Connection closed:', event);
};

socket.onerror = function(error) {
    console.log('WebSocket error:', error);
};