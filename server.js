const express = require("express");
const app = express();
const path = require('path');
const { isReadable } = require("stream");
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const auth = require('./js/auth.js');

app.set('view engine','ejs');
app.set("views",path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"public")))
app.use(express.json());

app.use('/',auth);

app.get("/",function (req, res) {
    console.log(req.route.path)
    res.render('pages/home');
})
checkAuthenticated = (req, res, next) => {
    
    if (req.isAuthenticated()) { 
        res.locals.auth = true;
        return next() 
    }
    res.locals.auth = false;
    return next()
    
}

app.get("/about",checkAuthenticated,function(req,res){
    console.log(res.locals.auth);
    var loggedIn = false;
    var name = { "email": "", "name": "", "displayName": "" };
    if(res.locals.auth){
        if (req.session.passport.user) {
            name = req.session.passport.user;
            loggedIn = true;
        }
    }
    res.render('pages/about', { name:name,loggedIn:loggedIn })
})


app.get("*",function (req, res) {
    fs.readFile('./views/pages' + req.originalUrl+".ejs",(err,data)=>{
        if(!err){
            res.render('pages' + req.originalUrl)
        }
        else{
            res.status(404);
            res.render('pages/404')
        }
    })
})

app.post("/api/msg", async (req,res) => {
    let db = new sqlite3.Database('./db/msg.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if(err){
            console.error(err.message);
        }
        console.log("Connected to db");
    })
    db.run(`CREATE TABLE IF NOT EXISTS messages(id,name,email,message)`,function(err){
        if(err){
            res.sendStatus(500);
            return console.log(err.message);
        }
        db.run(`INSERT INTO messages(id,name,email,message) VALUES(?,?,?,?)`, [uuidv4(), req.body.name, req.body.email, req.body.message], function (err) {
            if (err) {
                res.sendStatus(500)
                return console.log(err.message);
            }
            res.sendStatus(200);
        })
    })
    
    db.close();
    //res.render('pages/msgthanks',{"rep":req.body});
})

//uncomment if you port to google cloud
// const PORT = process.env["PORT"] || 8000;

// app.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}...`);
// });

//for hosting on my machine
if (process.env.NODE_ENV === 'development') {
    app.listen(3000, () => {
        console.log('running on port 3000 for dev...');
    });
}
if (process.env.NODE_ENV === 'production') {
    var http = require('http');
    var https = require('https');
    var privateKey = fs.readFileSync("/etc/letsencrypt/live/www.posis.me/privkey.pem");
    var certificate = fs.readFileSync("/etc/letsencrypt/live/www.posis.me/cert.pem");
    var credentials = {key: privateKey,cert:certificate};
    var httpServer = http.createServer(app);
    var httpsServer = https.createServer(credentials,app);


    httpServer.listen(80, () => {
        console.log('running on port 80 for prod...')
    });
    httpsServer.listen(443, () => {
        console.log('running on port 443 for prod...')
    });
}


