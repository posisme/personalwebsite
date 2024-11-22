#!/usr/bin/env node

const express = require("express");
const app = express();
const path = require('path');
const { isReadable } = require("stream");
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const basepicdir = "pictures/mount-pics/nfs"
const api = require('./js/api');
//const imgpred = require('./js/readpic');
const ExifImage = require('exif').ExifImage;


const auth = require('./js/auth');
const blog = require("./js/blog");

app.set('view engine','ejs');
app.set("views",path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"public")))
app.use(express.static(path.join(__dirname, basepicdir)));
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
    console.log("Admin?"+res.locals.auth);
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

app.get("/random", checkAuthenticated,(req, res) => {
    if(res.locals.auth){
        var list = fs.readdirSync(basepicdir)
    var pic = list[Math.floor(Math.random() * (list.length - 0) + 0)];
    var meta = new ExifImage({ image: basepicdir + "/" + pic }, function (err, exifData) {
        if (err){
            console.log(err);
            res.redirect("/random")
        }
        else
            res.render("pages/pic", { img: pic, meta: exifData });
    })
    }
    else{
        res.redirect("/login")
    }
})
app.get("/pic", checkAuthenticated,(req, res) => {
    if(res.locals.auth){
    //var p = imgpred.predictImage(basepicdir + "/" + req.query.pic);
    //console.log(p)
    var meta = new ExifImage({ image: basepicdir + "/" + req.query.pic }, function (err, exifData) {
        if (err){
            console.log(err);
            res.render("pages/pic", { img: req.query.pic, meta: { exif: { DateTimeOriginal: "unknown" } } })
        }
        else{
            res.render("pages/pic", { img: req.query.pic, meta: exifData });
        }
        
    })}
    else{
        res.redirect("/login")
    }
})
app.get("/pictures",checkAuthenticated,(req,res)=>{
    var list = fs.readdirSync(basepicdir)
    var last = list.map((f)=>{
        return {
            name:f,
            time:fs.statSync(basepicdir + "/"+ f).mtime.getTime(),
            type: f.split(/\./).pop()
        }
    })
    last = last.sort((a,b)=>{if(a.time < b.time) return 1; else return -1; return 1;})
    if(res.locals.auth){
        if (list)
            res.render("pages/picslist", { files: list, path: req.query.folder, last:last });
        else
            res.render("pages/pic404");
    }
    else {
        res.redirect("/login")
    }
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
    var certificate = fs.readFileSync("/etc/letsencrypt/live/posis.me/fullchain.pem");
    var privateKey = fs.readFileSync("/etc/letsencrypt/live/posis.me/privkey.pem");
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
    app.listen(3000, () => {
        console.log('running on port 3000...');
    });
}

