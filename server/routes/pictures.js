#!/usr/bin/env node

const express = require('express')
const router = express.Router();


const env = require('dotenv').config({path:"../../.env"});
const path = require('path');
const fs = require('fs');
const {dbrun} = require("../utils/sharedutils");
const basepicdir = process.env.BASEPICDIR;
const ExifReader = require('exifreader');
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

router.get("/rebuildpics", async (req,res)=>{
    let retjson = await rebuildPhotoDb();

    res.json(retjson)
    
    
    
})




router.get("/", async (req, res) => {
    var andorbool = req.query.andorbool ? req.query.andorbool : "or";
    var sql = "select *, Max(case when key = 'fav' and val = 'true' then 'true' else 'false' end) as fav, group_concat(personid) as people from pics left join picspeople on picid = filename left join pics_xtra using(filename)";

    var sqlp = [];
    var wherec = [];
    var havingc = [];
    if(req.query.person){
        var sqlandor
        
        
        if(andorbool == "or"){
            sqlandor = "personid IN ("+req.query.person.split(",").map(()=>"?").join(", ")+")";
            sqlp.push(...req.query.person.split(","));
            wherec.push(sqlandor);
        }
        else{
            sqlandor = req.query.person.split(",").map(()=>"people LIKE ?").join(" and ");
            sqlp.push(...req.query.person.split(",").map((e)=>"%"+e+"%"));
            havingc.push(sqlandor);
        }
        
        
        
    }
    

    if(req.query.authtf && req.query.authtf == "false"){
        havingc.push("fav = 'true'")
    }
    sql = sql + (wherec.length > 0?" WHERE "+ wherec.join(" and "):"");
    sql += " group by filename ";
    sql = sql + (havingc.length > 0?" HAVING " + havingc.join(" and "):"");
    sql += " order by fav DESC, date desc  "
    var total = await dbrun(sql,sqlp,"select")
    sql = sql + "limit "+req.query.max_rows+" offset "+req.query.offset;
    console.log(sql,sqlp);
    var listiles = await dbrun(sql,sqlp,"select");
    
    listiles = listiles.map((f)=>{
        return {filename:f.filename,data:{people:f.people,fav:f.fav}}
    });
    let allpeepssql = "select distinct personid, count(personid) as ct from picspeople group by personid order by ct desc";
    if(req.query.authtf && req.query.authtf == "false"){
        allpeepssql = 'select distinct personid, count(personid) as ct from pics_xtra join picspeople on picid = filename where key = "fav" and val = "true" group by personid order by ct desc';
    }
    let allpeeps = await dbrun(allpeepssql,[],"select");
    
    res.json({
        count:15,
        allpeeps:allpeeps,
        offset:req.query.offset,
        total:total.length,
        //total:100,
        files:listiles
    });

        
})
router.get("/picture",async (req,res)=>{
    var pic = await dbImg({filename:req.query.picture},{width:req.query.width?req.query.width:null,height:req.query.width?req.query.width:null});
    var attrs = await dbrun("select key,val from pics_xtra where filename = ?",[req.query.picture],"keyval");
    
    res.json({
        data:pic,
        allpeople:await dbrun("select distinct personid from picspeople group by personid order by count(personid) desc",[],"select"),
        attrs:attrs,
    })
})
router.post("/updatepics", async (req,res)=>{
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
router.get("/picfav", async (req,res)=>{
    let ret = [req.query];
    let currfav = await dbrun("select key,val from pics_xtra where filename = ? and key = 'fav'",[req.query.filename],"select");
    console.log(currfav,req.query.fav,req.query.filename);
    if(currfav && currfav.length){
        currfav = await dbrun("update pics_xtra set val = ? where filename = ? and key = 'fav'",[req.query.fav.toString(),req.query.filename],"update")
    }
    else{
        currfav = await dbrun("insert into pics_xtra (filename,key,val) values (?,'fav',?)",[req.query.filename,req.query.fav],"insert")
    }
    console.log(currfav);
    res.json({fav:req.query.fav})
})

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

module.exports = router;