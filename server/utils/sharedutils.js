#!/usr/bin/env node

const env = require('dotenv').config();
const path = require('path');
const fs = require('fs');
const ExifReader = require('exifreader');
const sqlite3 = require("sqlite3").verbose();
const dbpath = "server/db/personalsite.db";
const basepicdir = "/data/photoupload/upload/";
const db = new sqlite3.Database(path.join(__dirname,"../db/personalsite.db"),(err)=>{
    if(err) {return console.error(err.message)};
    return db;
});

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

async function dbImg(img){
    var deets = await ExifReader.load(basepicdir+img, {expanded:true});
    var people = [];
    if(deets.iptc && deets.iptc.Keywords && deets.iptc.Keywords.length){
    deets.iptc.Keywords.forEach((k)=>{
        people.push(k.description);
    })}
   
    deets.people = people.join(", ");
    return deets;
}


const rebuildPhotoDb = async () =>{
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
            
        
    await dbrun("drop table pics",null,"delete");
    await dbrun("drop table picspeople",null,"delete");
    await dbrun("create table pics (id integer primary key autoincrement,filename,date)",null,"create");
    await dbrun("create table picspeople (id integer primary key autoincrement,picid, personid)",null,"create");

    for(i=0;i<allfiles.length;i++){
            
            var b = fs.readFileSync(basepicdir+allfiles[i]);
            var s = fs.statSync(basepicdir+allfiles[i]);
            await dbrun("insert into pics (filename,date) values (?,?)",[allfiles[i],s.birthtime],"insert");
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
    return retjson;
}

module.exports ={dbrun,dbImg,basepicdir, rebuildPhotoDb};