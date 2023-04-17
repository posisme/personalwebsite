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
    let db = new sqlite3.Database('./db/msg.sqlite', sqlite3.OPEN_READWRITE, (err) => {
        if(err){
            console.error(err.message);
        }
        console.log("Connected to db");
    })
    db.run(`INSERT INTO messages(id,name,email,message) VALUES(?,?,?,?)`,[uuidv4(),req.body.name,req.body.email,req.body.message],function(err){
        if(err){
            res.sendStatus(500)
            return console.log(err.message);
        }
        res.sendStatus(200);
    })
    db.close();
    //res.render('pages/msgthanks',{"rep":req.body});
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});