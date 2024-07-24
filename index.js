const {QuickDB} = require("quick.db");
const express = require("express");
const server = express();
const session = require("express-session");
const path = require('path');
const bodyParser = require('body-parser');
const db = new QuickDB();
server.use(express.static(path.join(__dirname, 'public')));
const crypto = require('crypto');
const xss = require('xss');
const { info } = require("console");
server.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const http = require('http');
const WebSocket = require('ws');
server.use(session({
    secret: 'keyboard',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))
  const limiter = rateLimit({
    windowMs: 500,
    max: 10,
    message: "Too many requests, please try again later."
  });
  server.use(limiter);
  const http_server = http.createServer(server);
  const wss = new WebSocket.Server({ server:http_server });
const register_templete = {
    "username":null,
    "password":null,
    "id":null,
    "token":null
}
wss.on('connection', (ws) => {
    console.log('New client connected');
  
    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
      ws.send(`Server received: ${message}`);
    });
  
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
const charset = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@";
function generateSecureToken(length) {
    const randomBytes = crypto.randomBytes(length);
    const randomValues = Array.from(randomBytes);
    const token = randomValues.map(value => charset[value % charset.length]).join('');
    return token;
}
server.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get(`__${username}__account`);
    if (!user) {
        return res.redirect("/login.html");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
        req.session.ACCOUNT_TOKEN = user.token;
        req.session.ACCOUNT_ID = user.id;
        req.session.ACCOUNT_NAME = user.username;
        return res.redirect("/");
    } else {
        return res.redirect("/login.html");
    }
});
server.get("/gettoken", (req,res) => {
    //console.log(req.session.ACCOUNT_TOKEN);
    if(!req.session.ACCOUNT_TOKEN)return res.send("null");
    res.send(req.session.ACCOUNT_TOKEN.toString());
})
server.get("/getid", (req,res) => {
    //console.log(req.session.ACCOUNT_TOKEN);
    if(!req.session.ACCOUNT_ID)return res.send("null");
    res.send(req.session.ACCOUNT_ID.toString());
})
server.get("/logout", (req,res) => {
    req.session.ACCOUNT_ID=null;
    req.session.ACCOUNT_TOKEN=null;
    req.session.ACCOUNT_NAME=null;
    res.redirect("/");
})
server.post("/send_message", (req,res) => {
    if(!req.session.ACCOUNT_TOKEN) return res.redirect("/unauth");
    const id = req.body.id;
    const input = req.body.input;
    if(!id || !input) return res.redirect("/404.html");
    let response_data = {
        "status":404,
        "message":"Cannot send message."
    }
    db.all().then(async arr => {
        var has_breaked = false;
        setTimeout(function() {
            if(has_breaked== false) {
                response_data.message = "No conversation found";
                res.json(response_data);
            }
         }, 10000);
        for(const obj of arr) {
            if(obj.id.includes(req.session.ACCOUNT_ID)) {
                if(obj.id.includes(id)) {
                    has_breaked = true;
                    response_data.status=200;
                    response_data.message=`OK`;
                    var t =Date.now();
                    setTimeout(async function() {
                        await db.push(obj.id+`.conversation`, {"id":req.session.ACCOUNT_ID,"content":xss(input),"time":t});
                    },"1000");
                    res.json(response_data);
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                          client.send(JSON.stringify({
                            type: 'new_message',
                            data: {
                              id: req.session.ACCOUNT_ID,
                              destination:id,
                              time:t,
                              content: xss(input),
                            }
                          }));
                        }
                      });
                    break;
                }
            }
        }
    })
})
server.get("/getallconversation", (req,res) => {
    if(!req.session.ACCOUNT_TOKEN) return res.redirect("/unauth");
    let response_data = {
        "status":200,
        "message":"OK",
        "data":[]
    }
    /* 
    "id":value,
    "username":value,
    "latest_message":value,
    "isfromuser":value
    */
    db.all().then(async arr => {
         for(const obj of arr) {
            if(obj.id.includes(req.session.ACCOUNT_ID) && obj.id.startsWith("__conversation__")) {
                const arr_ = obj.id.split("__");
                var userid = arr_[2];
                if(arr_[2] == req.session.ACCOUNT_ID) userid = arr_[3];
                if(!isNaN(parseInt(userid))) {
                let prep = {
                    "id":userid,
                    "username":"",
                    "latest_message":"",
                    "isfromuser":"Them",
                    "time":Date.now()
                }
                if(obj.value.conversation.length>0) {
                prep.time = obj.value.conversation[obj.value.conversation.length-1].time;
                prep.latest_message=xss(obj.value.conversation[obj.value.conversation.length-1].content);
                if(obj.value.conversation[obj.value.conversation.length-1].content.length > 12) prep.latest_message = prep.latest_message.slice(0,9) + "...";
                if(obj.value.conversation[obj.value.conversation.length-1].id == req.session.ACCOUNT_ID) prep.isfromuser="You";
                db.all().then(arrs => {
                    for(const objs of arrs) {
                        if(objs.id.includes("__account")) {
                            if(objs.value.id == userid) {
                                prep.username=objs.value.username;
                                if(prep.username.length>12) prep.username = prep.username.slice(0,9) + "...";
                                break;
                            }
                        }
                    }
                })
            }
            response_data.data.sort(function(a,b) {
                return a-b;
            })
                response_data.data.push(prep);
        }
            }
         }   
    })
    setTimeout(function() {
        res.json(response_data);
    },"3000");
})
server.get("/getaccountdata",(req,res) => {
    if(!req.session.ACCOUNT_TOKEN) return res.redirect("/unauth");
    const id = req.query.id;
    let response_data = {
        "status":404,
        "message":"No account found",
        "data":{
            "id":"",
            "username":""
        }
    }
    if(!id) return res.json(response_data);
    db.all().then(async arr => {
        var has_breaked = false;
        setTimeout(function() {
            if(has_breaked== false) {
                res.json(response_data);
            }
         }, 10000);
        for(const obj of arr) {
            if(obj.value.id == id) {
                    has_breaked = true;
                    response_data.status=200;
                    response_data.message=`OK`;
                    response_data.data.id=obj.value.id;
                    response_data.data.username=xss (obj.value.username);
                    res.json(response_data);
                    break;
                
            }
        }
    })
})
server.get("/get_conversation",(req,res) => {
    if(!req.session.ACCOUNT_TOKEN) return res.redirect("/unauth");
    const id = req.query.id;
    let response_data = {
        "status":406,
        "message":"You cannot have a conversation with your self!",
        "conversation":[]
    }
    if(!id)  return res.json(response_data);
    if(id== req.session.ACCOUNT_ID) return res.json(response_data);
    db.all().then(async arr => {
        var has_breaked = false;
        setTimeout(function() {
            if(has_breaked== false) {
                response_data.message = "No conversation found";
                res.json(response_data);
            }
         }, 10000);
        for(const obj of arr) {
            if(obj.id.includes(req.session.ACCOUNT_ID)) {
                if(obj.id.includes(id)) {
                    has_breaked = true;
                    response_data.status=200;
                    response_data.message=`OK`;
                    response_data.conversation=obj.value.conversation;
                    res.json(response_data);
                    break;
                }
            }
        }
    })
})
server.post("/create_new_conversation",(req,res) => {
    if(!req.session.ACCOUNT_TOKEN) return res.redirect("/unauth");
    const username = req.body.username;
    let response_data = {
        "status":406,
        "message":"You cannot have a conversation with your self!"
    }
    if(!username)  return res.json(response_data);
    if(username== req.session.ACCOUNT_NAME) return res.json(response_data);
    db.all().then(async arr => {
        var has_breaked = false;
        setTimeout(function() {
            if(has_breaked== false) {
                response_data.message = "User not found! (Either the user do not exist or the username has changed, you mistyped the username,...)";
                res.json(response_data);
            }
         }, 10000);
        for (const obj of arr) {
            if (obj.id.startsWith(`__${username}__account`)) {
                let information = obj.value;
                if(!isNaN(parseInt(information.id)))
                {
                    has_breaked=true;
                    let conversation_data = {
                        "conversation": []
                    };
                    const check = await db.get(`__conversation__${req.session.ACCOUNT_ID}__${information.id}__`);
                    const check2 = await db.get(`__conversation__${information.id}__${req.session.ACCOUNT_ID}__`);
                    if(!check && !check2) await db.set(`__conversation__${req.session.ACCOUNT_ID}__${information.id}__`, conversation_data);
                    response_data.status=200;
                    response_data.message=`${information.id}`;
                    res.json(response_data);
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                          client.send(JSON.stringify({
                            type: 'new_conversation',
                            data: {
                              id: req.session.ACCOUNT_ID,
                              destination:information.id,
                              time:Date.now(),
                            }
                          }));
                        }
                      });
                    break;
            }
            }
        }
    });
})
server.get("/getname", (req,res) => {
    if(!req.session.ACCOUNT_NAME)return res.send("null");
    res.send(req.session.ACCOUNT_NAME.toString());
})
server.post("/register", async (req, res) => {
    const { username, password, password_ } = req.body;
    if (
        username.length < 8 || 
        username.length > 32 || 
        password.length < 8 || 
        password.length > 512
    ) {
        return res.redirect("/register.html");
    }
    if (password !== password_) {
        return res.redirect("/register.html");
    }
    const sanitizedUsername = xss(username);
    const user = await db.get(`__${sanitizedUsername}__account`);
    if (user) {
        return res.send("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let n_data = { ...register_templete };
    n_data.username = sanitizedUsername;
    n_data.password = hashedPassword;
    n_data.id = Math.floor(Date.now() / 1000);
    n_data.token = generateSecureToken(45) + ":" + generateSecureToken(30) + "@" + generateSecureToken(username.length + 3 * password.length);
    await db.set(`__${sanitizedUsername}__account`, n_data);
    req.session.ACCOUNT_TOKEN = n_data.token;
    req.session.ACCOUNT_NAME = n_data.username;
    req.session.ACCOUNT_ID = n_data.id;
    res.redirect("/");
});
server.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

http_server.listen(3000, () => console.log("Listen on port 3000"));