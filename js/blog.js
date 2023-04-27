const express = require('express')
const app = express();
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));



app.get("/blog/:article", async (req, res) => {
    
    let db = new sqlite3.Database('./db/writing.sqlite', sqlite3.OPEN_READWRTTE, (err) => {
        if (err) {
            console.error(err.message);
        }
        else{
            console.log("Connected to db");
        }
        
    })
    db.all('SELECT * from writing where id = ?',[req.params.article], function (err,row) {
        if (err) {
            res.redirect("/writing");
        }
        else{
            if(!row.length){
                res.redirect("/writing");
            }
            res.render("pages/blog",{content:row});
        }
    })

    db.close();
})

app.get("/blog/*/*",(req,res)=>{
    res.redirect("/writing");
})

module.exports = app;
