#!/usr/bin/env node

const express = require("express");
const cors = require('cors');
const env = require('dotenv').config({path:'../.env'});
const app = express();
const path = require('path');
const basedocsdir = process.env.BASEDOCDIR;
const basemealsdir = process.env.BASEMEALSDIR;
const basemddir = process.env.BASEMDDIR;
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const https = require('https');
const bearerToken = require('bearer-token');
const authenticate = (req,res,next)=>{
    const origin = req.headers.referer;
    const host = req.headers.host;
    
    if(origin && host && (new URL(origin).host === host || new URL(origin).host == "posis.me")){
        //console.log("Request from same domain");
        next();
        return;
    }
    else if (!origin || origin === "") {
        if (
            req.headers['x-forwarded-for'] === '204.144.226.188'
        ) {
            //console.log("Request from localhost, skipping authentication");
            next();
            return;
        }
    }
    bearerToken(req,async (err,token)=>{
        
        if(err){
            return res.status(501).json({error:"Auth error."})
        }
        if(!token){
            return res.status(401).json({error:"No Token Provided"});
        }
        if(!await isValidApikey(token)){
            return res.status(403).json({error:"Invalid API token"});
        }
        next();
        
        
    })
    
    
}
const isValidApikey = async (apikey)=>{
    try{
        const hashedkeys = await dbrun("select api_key from api_keys",[],"select");
        for(i=0;i<hashedkeys.length;i++){
            var b = await bcrypt.compare(apikey,hashedkeys[i].api_key);
            if(b){
                return true;
            }
        } 
    } catch(error){
        console.error("ERROR",error);
        return false;
    }
    return false;

}


const {dbrun,dbImg,basepicdir,rebuildPhotoDb,writeExif} = require("./utils/sharedutils");

app.use(express.json());

app.use(authenticate);


app.use(cors({
    origin:'https://posis.me'
}))

app.get("/test",(req,res)=>{
    res.json({hello:"hello"});
})

app.post("/meals",(req,res)=>{
    var meals = req.body;
    fs.writeFileSync(basemealsdir+"grocerylist.json",JSON.stringify(meals));
    res.json(meals);
})
app.get("/grocerylist",(req,res)=>{
    fs.readFile(basemealsdir+"grocerylist.json",'utf-8',(err,data)=>{
        if(err){console.log(err)}
        try{
            var dataj = JSON.parse(data);
        }
        catch(err){
            console.log(err);
        }
        res.json(dataj)
    })
})

app.post("/groceryupdate",(req,res)=>{
    fs.writeFileSync(basemealsdir+"grocerylist.json",JSON.stringify(req.body))
    res.json(req.body)
})
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

app.get("/mdviewer",(req,res)=>{
    var retjson = {file:""};
    var fp = req.query.filepath != "null" ? req.query.filepath: "/"
    if(req.query.doc){
        var f = fs.readFileSync(basemddir+"/"+decodeURIComponent(req.query.doc)).toString('utf8');
        retjson.file = f;
    }
    else{
        retjson.filelist = fs.readdirSync(basemddir+fp).filter(file => !file.startsWith('.'))
    }
    res.json(retjson)
})
app.post("/mdpost",(req,res)=>{
    if(req.body.filename){
        var f = fs.writeFileSync(basemddir+"/"+req.body.filename,req.body.content);
    }
    res.json(f);
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
app.post("/setapikey", async (req,res)=>{
    var ret;
    console.log(req.body);
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
          // Handle error
          return;
        }
        bcrypt.hash(req.body.apikey, salt,( err,hash)=>{

            if(err){
                console.log("error in password", err);
                res.send({"d":"error"});
            }
            dbrun("insert into api_keys (api_key) values (?)",
                [  
                    hash
                ],
                "insert");
            res.send({"d":"updated"});
        });
      });
    
    
})
app.use('/login', async (req,res)=>{
    var ret = "";
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
