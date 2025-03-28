#!/usr/bin/env node

const express = require("express");
const cors = require('cors');
require('dotenv').config();
const app = express();
const path = require('path');
// const { isReadable } = require("stream");
// const { v4: uuidv4 } = require('uuid');
const basepicdir = "/data/photoupload/upload/";
const basedocsdir = "../client/public/writing_docs/";
const fs = require('fs');

const imageMagick = require('imagemagick');
const {convert} = require('imagemagick-convert');
const ExifReader = require('exifreader');
const { getDefaultAutoSelectFamily } = require("net");
const sqlite3 = require("sqlite3").verbose();

// const { rejects } = require("assert");
app.use(express.json());

// app.use((req, res, next) => {
//     const timestamp = new Date().toISOString();
//     const method = req.method;
//     const url = req.url;
//     const ip = req.ip;
//     console.log(`[${timestamp}] ${method} ${url} from ${ip}`);
//     next(); // Call next to pass control to the next middleware/route handler
//   });

app.use(cors({
    //origin:['https://posis.me','http://localhost:3000','http://posis.me','https://www.posis.me']
    origin:'https://posis.me'
}))
const db = new sqlite3.Database("./db/personalsite.db",(err)=>{
    if(err) {return console.error(err.message)};
    return db;
});



//the nginx redirects anything /api to this servers / endpoint, so though it is going to /api, this
//endpoint is just /
app.get("/rebuildpics", async (req,res)=>{
    console.log("rebuilding pics");
    let retjson=[];
    var allfiles = fs.readdirSync(basepicdir, {withFileTypes:true})
            .filter(dirent => dirent.isFile())
            .filter(dirent => dirent.name.match(/\.(jpg|jpeg)/))
            .map(dirent => dirent.name);
            
        allfiles = allfiles.map(fileName =>({
            name:fileName,
            time:fs.statSync(path.join(basepicdir,fileName)).mtime.getTime()
        }))
        .sort((a,b)=>b.time - a.time)
        .map(file=>file.name);
        
    // allfiles = [
    //     "IMG_20111117_182058.jpg", "IMG_20110515_151316.jpg", "20131227_153420.jpg", "100_0146.jpg", "0606081035.jpg"
    // ];
   await dbrun("drop table pics",null,"delete");
   await dbrun("drop table picspeople",null,"delete");
   await dbrun("create table pics (id integer primary key autoincrement,filename)",null,"create");
   await dbrun("create table picspeople (id integer primary key autoincrement,picid, personid)",null,"create");

   for(i=0;i<allfiles.length;i++){
        await dbrun("insert into pics (filename) values (?)",[allfiles[i]],"insert");
        var b = fs.readFileSync(basepicdir+allfiles[i]);
        try {
            var f = ExifReader.load(b, {expanded:true,includeUnknown:true});
            if(f && f.iptc && f.iptc.Keywords && f.iptc.Keywords.length){
                f.iptc.Keywords.forEach((k)=>{
                    dbrun("insert into picspeople (picid,personid) values (?,?)",[allfiles[i],k.description],"insert")
                    .catch((e)=>{console.log("err",e)})
                }
            )}
        
            retjson.push(allfiles[i]);
        } catch (error) {
            var t = "blah"
            console.log("bad",allfiles[i],error)
        }
        
        


    };
    res.json(retjson)
    
    
    
})
app.get("/pictures", async (req, res) => {
    var sql = "select * from pics left join picspeople on picid = filename";
    //console.log(sql)
    var sqlp = []
    if(req.query.person){
        sql = sql + " where personid = ?";
        sqlp.push(req.query.person);
    }
    sql += " limit "+req.query.max_rows+" offset "+req.query.offset;
    var listiles = await dbrun(sql,sqlp,"select");
    listiles = listiles.map((f)=>{return f.filename});
    
    for(let i=0;i<listiles.length;i++){
        listiles[i] = await getImg(listiles[i],{width:100,height:100});
    }
    
    
    res.json({count:15,offset:req.query.offset,total:listiles.length,files:listiles});
        
})
app.get("/picture",async (req,res)=>{
    var pic = await getImg(req.query.picture,{width:req.query.width?req.query.width:null,height:req.query.width?req.query.width:null});
    res.json({data:pic})
})
app.get("/getdocs",async (req,res)=>{
    var docs = await getDocs();
    res.json({data:docs});
})

app.get("/",(req,res)=>{
    res.json({error:"no api selected"})
})
async function getDocs(){
    var alldocs = fs.readdirSync(basedocsdir);
    var retobj = [];
    alldocs.forEach(async (d)=>{
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
async function dbImg(img){
    var deets = await ExifReader.load(basepicdir+img, {expanded:true});
    var people = [];
    if(deets.iptc && deets.iptc.Keywords && deets.iptc.Keywords.length){
    deets.iptc.Keywords.forEach((k)=>{
        people.push(k.description);
    })}
   
    // try{
    //     var d = await dbrun(db,`Select filename,group_concat(personid) as people from pics join picspeople on (picid = filename) where filename = ?`,[img],"select");
    //     if(d && d.length < 1){
    //         await dbrun(db,`INSERT INTO pics (filename) VALUES(?)`,[img],"insert");
    //         for(p in people){
    //             await dbrun(db,`INSERT INTO picspeople (picid, personid) VALUES(?,?)`,[img,people[p]],"insert");
    //         }
    //     }
        
    // }
    // catch(error){
    //     console.log(error)
    // }
    // finally{
    //     db.close();
    // }
    deets.people = people.join(", ");
    return deets;
    
}

const dbrun = async (sql, params = [],crud)=>{
    
    if(!crud){
        crud = "select";
    }
    if(crud == "update" || crud == "insert"){
        return new Promise((resolve, reject)=>{
            db.run(sql,params,(err)=>{
                if(err) reject(err);
                resolve();
            })
        })
    }
    else if(crud == "select"){
        return new Promise((resolve, reject)=>{
            db.all(sql,params,(err,rows)=>{
                if(err) reject(err);
                resolve(rows);
            })
        })
    }
    else if(crud == "create" || crud=="delete"){
        return new Promise((resolve,reject)=>{
            db.exec(sql,(err)=>{
                if(err) reject(err);
                resolve();
            });
        });
    }
}
async function getImg(img,size){
    var i = await dbImg(img);
    return {filename:img,data:i};
    // if(fs.existsSync("../client/public/thumbs/"+img)){
    //     return {filename:img}
    // }
    
    // var args = {
    //     srcData:fs.readFileSync(basepicdir+img),
    //     resize:"crop",
    //     format:"JPG"
    // }
    // if(size && size.width){
    //     args.width = size.width;
    // }
    // if(size && size.height){
    //     args.height = size.height;
    // }
    // try {
    //     const newimg = await convert(args);
    //     //fs.writeFile("../client/public/thumbs/"+img,newimg,(err)=>{
    //         //console.log(err);
    //     //})
    //     return {filename:img,data:newimg};
    // } catch (error) {
    //     //fs.renameSync(basepicdir+img,basepicdir+"hold/"+img)
    //     console.log(error);
    //     return false;
    // }
    
    
}

app.listen(6125, () => {
    console.log('running on port 6125...');
});

