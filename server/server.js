#!/usr/bin/env node

const express = require("express");
const cors = require('cors');
const env = require('dotenv').config({path:'../.env'});
const app = express();
const path = require('path');
const basedocsdir = process.env.BASEDOCDIR;
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;



const {dbrun,dbImg,basepicdir,rebuildPhotoDb,writeExif} = require("./utils/sharedutils");



app.use(express.json());



app.use(cors({
    origin:'https://posis.me'
}))




//the nginx redirects anything /api to this servers / endpoint, so though it is going to /api, this
//endpoint is just /
app.get("/rebuildpics", async (req,res)=>{
    let retjson = await rebuildPhotoDb();

    res.json(retjson)
    
    
    
})
app.get("/pictures", async (req, res) => {
    var sql = "select *, group_concat(personid) as people from pics left join picspeople on picid = filename";
    var totalsql = "select count(*) as count from pics";
    var sqlp = []
    if(req.query.person){
        sql = sql + " where personid = ?";
        totalsql = totalsql + " left join picspeople on picid = filename where personid = ?";
        sqlp.push(req.query.person);
    }
    sql += " group by filename order by date desc ";
    
    sql += "limit "+req.query.max_rows+" offset "+req.query.offset;
    
    var listiles = await dbrun(sql,sqlp,"select");
    
    listiles = listiles.map((f)=>{return {filename:f.filename,data:{people:f.people}}});
    
    var total = await dbrun(totalsql,sqlp,"select")
    
    res.json({
        count:15,
        offset:req.query.offset,
        total:total[0].count,
        //total:100,
        files:listiles
    });
        
})
app.get("/picture",async (req,res)=>{
    var pic = await dbImg({filename:req.query.picture},{width:req.query.width?req.query.width:null,height:req.query.width?req.query.width:null});
    res.json({data:pic,allpeople:await dbrun("select distinct personid from picspeople group by personid order by count(personid) desc",[],"select")})
})
app.post("/updatepics", async (req,res)=>{
    let ret = [req.body];
    //writeExif(basepicdir+"/"+req.body.filename,{Keywords:null});
    var p = await dbrun("delete from picspeople where picid = ?",[req.body.filename],"delete");
    
    let people = [];
    for(let i in req.body){
        if(i.match(/^taggedPeople-/)){
            people.push(req.body[i]);
        }
    }
    console.log(people);
    if(typeof req.body.whoBox === "string" && req.body.whoBox != ""){
        peoplesplit = req.body.whoBox.split(/[\n,]/).map(f=>f.trim());
        people = [...people,...peoplesplit];
    }
    console.log(people);
    people.forEach(async (person)=>{
        await dbrun("insert into picspeople (personid, picid) values (?,?)",[person.trim(), req.body.filename],"insert");
    })
    
    
    writeExif(req.body.filename,{"Keywords":people},basepicdir+"archive/");
    res.json(ret);
})

app.get("/getdocs",async (req,res)=>{
    var docs = await getDocs();
    res.json({data:docs});
})

app.get("/",(req,res)=>{
    res.json({error:"no api selected"})
})
app.post("/setlogin", async (req,res)=>{
    var ret;
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
          // Handle error
          return;
        }
        bcrypt.hash(req.body.password, salt,( err,hash)=>{

            if(err){
                console.log("error in password", err);
                res.send({"d":"error"});
            }
            dbrun("insert into authusers (username,hashepassword,name,email) values (?,?,?,?)",
                [  
                    req.body.username,
                    hash,
                    req.body.name,
                    req.body.email
                ],
                "insert");
            res.send({"d":"updated"});
        });
      });
    
    
})
app.use('/login', async (req,res)=>{
    var ret = "";
    
    console.log(ret);
    var user = await dbrun("select username,hashepassword as h,name,email  from authusers where username = ?",[req.body.username],"select")
    if(user && user.length){
        bcrypt.compare(req.body.password,user[0].h,(err,result)=>{
            if(err){
                console.log("error in compare",err);
                res.send({"user":null})
                return;
            }
            if(result){
                console.log("Passwords match");
                res.send({"name":user[0].name,"email":user[0].email});
            }
            else{
                console.log("Passwords don't match");
                res.send({"user":null})
            }
        })
    }
    else{
        console.log("no user found");
        res.send({"user":null})
    }
});

async function getDocs(){
    var alldocs = fs.readdirSync(basedocsdir, {withFileTypes:true});
    alldocs = alldocs.filter(dirent => dirent.isFile()).map(dirent=>dirent.name);
    var retobj = [];
    alldocs.forEach(async (d)=>{
        console.log(d);
        var td = fs.readFileSync(basedocsdir+d);
        var title = "";
        if(td.toString('utf8').match(/^#[\s]*[\*]*([^\*]*)[\*]*\n/)){
            title = td.toString('utf8').match(/^#[\s]*[\*]*([^\*]*)[\*]*\n/)[1];
        }
        else{
            title = d;
        }
        retobj.push({title:title,link:d})
    })
    return retobj;
}



app.listen(6125, () => {
    console.log(`running on port 6125...`);
});