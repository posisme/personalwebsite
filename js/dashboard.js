const express = require('express')
const app = express();
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

checkAuthenticated = (req, res, next) => {

    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/login?returnTo=" + req.route.path)
}
checkAdmin = (req,res,next)=>{
    if(req.user.email == "posisme@gmail.com"){
        res.locals.admin = true;
        next();
    }
    else{
        return next();
    }
    
}

app.get("/dashboard", checkAuthenticated, checkAdmin,(req,res)=>{
    if(res.locals.admin){
        var comments = [];
        let db = new sqlite3.Database('./db/msg.sqlite', sqlite3.OPEN_READ, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log("Connected to db");
        })
        db.all('Select * from messages', [],function (err,rows) {
            if (err) {
                res.sendStatus(500)
                return console.log(err.message);
            }
            res.render('pages/admin', { name: req.user, comments: rows })
        })
        db.close();
        
        
    }
    else{
        res.render('pages/dashboard', { name: req.user })
    }
})

app.post("/api/rmmsg", async (req, res) => {
    let db = new sqlite3.Database('./db/msg.sqlite', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Connected to db");
    })
    db.run(`DELETE FROM messages WHERE id = ? `, [req.body.id], function (err) {
        if (err) {
            res.sendStatus(500)
            return console.log(err.message);
        }
        res.sendStatus(200);
    })
    db.close();
    //res.render('pages/msgthanks',{"rep":req.body});
})

module.exports = app;
