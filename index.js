const {QuickDB} = require("quick.db");
const express = require("express");
const server = express();
const session = require("express-session");
const path = require('path');
const bodyParser = require('body-parser');
const db = new QuickDB();
server.use(express.static(path.join(__dirname, 'public')));
const crypto = require('crypto');
server.use(bodyParser.urlencoded({ extended: true }));
server.use(session({
    secret: 'keyboard',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))
const register_templete = {
    "username":null,
    "password":null,
    "id":null,
    "token":null
}
const charset = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@";
function generateSecureToken(length) {
    const randomBytes = crypto.randomBytes(length);
    const randomValues = Array.from(randomBytes);
    const token = randomValues.map(value => charset[value % charset.length]).join('');
    return token;
}
server.post("/login", async (req,res) => {
    const { username, password } = req.body;
    const user = await db.get(`__${username}__account`);
    if(!user) {
        return res.redirect("/login.html");
    }
    if(user) {
        if(user.password == password) {
            req.session.ACCOUNT_TOKEN= user.token;
            req.session.ACCOUNT_ID= user.id;
            req.session.ACCOUNT_NAME= user.username;
            //console.log(req.session.ACCOUNT_TOKEN);
            return res.redirect("/");
        }else {
             return res.redirect("/login.html");
        }
    }
})
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
                    setTimeout(async function() {
                        await db.push(obj.id+`.conversation`, {"id":req.session.ACCOUNT_ID,"content":input,"time":Date.now()});
                    },"1000");
                    res.json(response_data);
                    break;
                }
            }
        }
    })
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
                    response_data.data.username=obj.value.username;
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
server.get("/create_new_conversation",(req,res) => {
    if(!req.session.ACCOUNT_TOKEN) return res.redirect("/unauth");
    const username = req.query.username;
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
                has_breaked=true;
                let information = obj.value;
                let conversation_data = {
                    "conversation": []
                };
                const check = await db.get(`__conversation__${req.session.ACCOUNT_ID}__${information.id}__`);
                const check2 = await db.get(`__conversation__${information.id}__${req.session.ACCOUNT_ID}__`);
                if(!check && !check2) await db.set(`__conversation__${req.session.ACCOUNT_ID}__${information.id}__`, conversation_data);
                response_data.status=200;
                response_data.message=`${information.id}`;
                res.json(response_data);
                break;
            }
        }
    });
})
server.get("/getname", (req,res) => {
    //console.log(req.session.ACCOUNT_TOKEN);
    if(!req.session.ACCOUNT_NAME)return res.send("null");
    res.send(req.session.ACCOUNT_NAME.toString());
})
server.post("/register", async (req,res) => {
    const { username, password, password_ } = req.body;
    if(username.split("").length < 8 || username.split("").length > 32 || password.split("").length < 8)
    {
        return res.redirect("/register.html");
    }
    const user = await db.get(`__${username}__account`);
    if(user)
    {
        return res.write("User already exists");
    }
    if(password != password_) {
        return res.redirect("/register.html");
    }
    let n_data = register_templete;
    n_data.username=username;
    n_data.password=password;
    n_data.id=Math.floor(Date.now()/1000);
    n_data.token=generateSecureToken(45);
    n_data.token+=":";
    n_data.token+=generateSecureToken(30);
    n_data.token+="@";
    n_data.token+=generateSecureToken(username.length + 3 * password.length);
    await db.set(`__${username}__account`,n_data);
    req.session.ACCOUNT_TOKEN= n_data.token;
    res.redirect("/");
})
server.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

server.listen(3000, () => console.log("Listen on port 3000"));