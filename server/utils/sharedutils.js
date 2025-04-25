#!/usr/bin/env node

const env = require('dotenv').config({path:"../../.env"});
const path = require('path');
const fs = require('fs');
const ExifReader = require('exifreader');
const sqlite3 = require("sqlite3").verbose();
const basepicdir = process.env.BASEPICDIR;
const db = new sqlite3.Database(path.join(__dirname,"../db/personalsite.db"),(err)=>{
    if(err) {return console.error(err.message)};
    return db;
});
const {
    DefaultExiftoolArgs,
    DefaultExifToolOptions,
    ExifTool,
  } = require('exiftool-vendored');
  
const exiftool = new ExifTool({
    ...DefaultExifToolOptions,
    exiftoolArgs: [
        ...DefaultExiftoolArgs,
        '-overwrite_original',
        // other CLI arguments
],
});
//const { exiftool } = require('exiftool-vendored');

const dbrun = async (sql, params = [],crud)=>{
    
    if(!crud){
        crud = "select";
    }
    if(crud == "update" || crud == "insert" || crud == "delete"){
        return new Promise((resolve, reject)=>{
            db.run(sql,params,(err)=>{
                if(err) reject(err);
                resolve({resolved:crud});

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
    else if(crud == "create" || crud=="drop"){
        return new Promise((resolve,reject)=>{
            db.exec(sql,(err)=>{
                if(err) reject({error:err});
                resolve({resolved:crud});
            });
        });
    }
}

async function dbImg(img){
    var deets = await ExifReader.load(basepicdir+img.filename, {expanded:true});
    deets.people = img.people;
    return {filename:img.filename,data:deets};
}

async function writeExif(img, tags,archivepath){
    try{
        await exiftool.write(basepicdir+img,tags).then(()=>{console.log("writing tags");}).finally(()=>{
            
            console.log("written");
        });
        try{
            fs.renameSync(basepicdir+img+"_original",archivepath+img+"_original");
        }
        catch(err){
            console.log("ERROR1",err);
        }
        
    }
    catch (err){
        console.log("ERROR2",tags,err);
        return false;

    }
    return true;
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
            
        
    await dbrun("drop table if exists pics",null,"drop");
    await dbrun("drop table if exists picspeople",null,"drop");
    await dbrun("create table pics (id integer primary key autoincrement,filename,date)",null,"create");
    await dbrun("create table picspeople (id integer primary key autoincrement,picid, personid)",null,"create");

    for(i=0;i<allfiles.length;i++){ 
        var b = fs.readFileSync(basepicdir+allfiles[i]);
        var s = fs.statSync(basepicdir+allfiles[i]);
        
        await dbrun("insert into pics (filename,date) values (?,?)",[allfiles[i],s.birthtime],"insert");
        try {
            var f = ExifReader.load(b, {expanded:true,includeUnknown:true});
            //if(Array.isArray(result.data.data.data.iptc.Keywords)){
            //     var p = result.data.data.data.iptc.Keywords.map((f)=>{return f.description});
            // }
            // else{
            //     var p = result.data.data.data.iptc.Keywords.description;
            // }
            if(f && f.iptc && f.iptc.Keywords){
                if(Array.isArray(f.iptc.Keywords)){
                    f.iptc.Keywords.forEach((k)=>{
                        dbrun("insert into picspeople (picid,personid) values (?,?)",[allfiles[i],k.description],"insert")
                        .catch((e)=>{console.log("err",e)})

                    }
                )}
                else {
                    dbrun("insert into picspeople (picid,personid) values (?,?)",[allfiles[i],f.iptc.Keywords.description],"insert")
                        .catch((e)=>{console.log("err",e)})
                }
            }
        
            retjson.push(allfiles[i]);
        } catch (error) {
            var t = "blah"
            console.log("bad",allfiles[i],error)
        }
        
            


    };
    console.log("done rebuilding")
    return retjson;
}

module.exports ={dbrun,dbImg,basepicdir, rebuildPhotoDb,writeExif};