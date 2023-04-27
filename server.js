#!/usr/bin/env node

const express = require("express");
const app = express();
const path = require('path');
const { isReadable } = require("stream");
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const api = require('./js/api');

const auth = require('./js/auth');
const blog = require("./js/blog");

app.set('view engine','ejs');
app.set("views",path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"public")))
app.use(express.json());

app.use('/',auth);
app.use('/',api);
app.use('/',blog);

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
else if (process.env.NODE_ENV === 'production') {
    var http = require('http');
    var https = require('https');
    var privateKey = fs.readFileSync("/var/www/personalwebsite/privkey.pem");
    var certificate = fs.readFileSync("/var/www/personalwebsite/cert.pem");
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
else{
    console.log("No NODE_ENV set, server is not running...")
}

