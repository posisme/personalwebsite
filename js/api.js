const express = require('express')
const app = express();
const fs = require('fs');
const basepicdir = "pictures/mount-pics/nfs"

const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const { disable } = require('./api');

app.use(bodyParser.urlencoded({ extended: true }));



app.post("/api/msg", async (req, res) => {
    let db = new sqlite3.Database('./db/msg.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Connected to db");
    })
    db.run(`CREATE TABLE IF NOT EXISTS messages(id,name,email,message)`, function (err) {
        if (err) {
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
app.post("/api/pics",async(req,res)=>{
    
    if(req.query.action == "delete"){
        
        req.body.dellist.forEach(function(l){
            console.log(basepicdir +"/"+l)
            fs.rename(basepicdir + "/" + l, basepicdir +"/archive/"+l, function(){
                
            })
        })
        res.json({done:req.body.dellist});
    }
    else if(req.query.action == "rename"){
        if(fs.existsSync(basepicdir+"/"+req.body.newname)){
            res.json({error:"filename already exists"})
        }
        else{
            fs.rename(basepicdir+"/"+req.body.oldname, basepicdir+"/"+req.body.newname, function(error){
			if(error){
				console.log(error);
			}
		})
            res.json({done:req.body.newname});
        }
    }
    
})

app.get("/api/getwriting", async(req,res)=>{
    let db = new sqlite3.Database('./db/writing.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Connected to db");
    })
    db.all('Select * from writing where id = ?', [req.query.id], function (err, rows) {
        if (err) {
            res.sendStatus(500)
            return console.log(err.message);
        }
        
        res.json(rows);
        
    })

    db.close();
})

module.exports = app;
