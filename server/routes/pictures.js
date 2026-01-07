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
const imagemagick = require('imagemagick-convert');
const {writeExif,rebuildPhotoDb,dbImg} = require("../utils/rebuildphotodbscript.js");


//const { exiftool } = require('exiftool-vendored');

router.get("/rebuildpics", async (req,res)=>{
    let retjson = await rebuildPhotoDb();

    res.json(retjson)
    
    
    
})




router.get("/", async (req, res) => {
    var andorbool = req.query.andorbool ? req.query.andorbool : "or";
    let sql = "";
    if (req.query.tags) {
        let favs = await dbrun("select *, Max(case when key = 'fav' and val = 'true' then 'true' else 'false' end) as fav from pics left join pics_xtra using(filename) group by filename having fav = 'true'", [], "select");
        favs = favs.map((f)=>{return f.filename});
        sql = "select * from pics left join pics_xtra using(filename) where key = 'tag' and val = ? ";
        if (req.query.authtf && req.query.authtf == "false"){
            sql += " and filename IN ('"+favs.join("','")+"') "
        }
        sqlp = [req.query.tags];
    }
    else{
        sql = "select *, Max(case when key = 'fav' and val = 'true' then 'true' else 'false' end) as fav, group_concat(personid) as people from pics left join picspeople on picid = filename left join pics_xtra using(filename)";

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
        

        
        if (req.query.authtf && req.query.authtf == "false") {
            havingc.push("fav = 'true'")
        }

    
    
        sql = sql + (wherec.length > 0?" WHERE "+ wherec.join(" and "):"");
        sql += " group by filename ";
        sql = sql + (havingc.length > 0?" HAVING " + havingc.join(" and "):"");
        sql += " order by fav DESC, date desc  "
        
    }
    
    var total = await dbrun(sql, sqlp, "select")
    sql = sql + "limit " + req.query.max_rows + " offset " + req.query.offset;
    //console.log(sql, sqlp);
    var listiles = await dbrun(sql,sqlp,"select");
    //console.log(listiles);
    listiles = await Promise.all(
        listiles.map(
            (f)=>{
                return {
                    filename:f.filename,
                    data:{people:f.people,fav:f.fav},
                }
            }
        )
    );
    let allpeepssql = "select distinct personid, count(personid) as ct from picspeople group by personid order by ct desc";
    if(req.query.authtf && req.query.authtf == "false"){
        allpeepssql = 'select distinct personid, count(personid) as ct from pics_xtra join picspeople on picid = filename where key = "fav" and val = "true" group by personid order by ct desc';
    }
    let allpeeps = await dbrun(allpeepssql,[],"select");
    
    let alltagssql = "select distinct val as tags from pics_xtra where key = 'tag'";
    let alltags = await dbrun(alltagssql,[],"select");

    res.json({
        count:15,
        allpeeps:allpeeps,
        alltags:alltags,
        offset:req.query.offset,
        total:total.length,
        //total:100,
        
        files:listiles
    });

        
})
router.get("/picture",async (req,res)=>{
    var pic = await dbImg({filename:req.query.picture},{width:req.query.width?req.query.width:null,height:req.query.height?req.query.height:null});
    var attrs = await dbrun("select key,val from pics_xtra where filename = ?",[req.query.picture],"keyval");
    
    res.json({
        data:pic,
        allpeople:await dbrun("select distinct personid from picspeople group by personid order by count(personid) desc",[],"select"),
        alltags:await dbrun("select distinct val from pics_xtra where key = 'tag'",[],"select"),
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
router.get("/isrebuildrunning",(req,res)=>{
    console.log("running:",global.isRebuildRunning);
    res.json({running:global.isRebuildRunning});
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




module.exports = router;