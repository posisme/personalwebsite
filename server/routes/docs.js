#!/usr/bin/env node

const express = require('express')
const router = express.Router();
const fs = require('fs');
const basedocsdir = process.env.BASEDOCDIR;


router.get("/getdocs",async (req,res)=>{
    var docs = await getDocs();
    res.json({data:docs});
})

router.get("/mdviewer",(req,res)=>{
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
router.post("/mdpost",(req,res)=>{
    if(req.body.filename){
        var f = fs.writeFileSync(basemddir+"/"+req.body.filename,req.body.content);
    }
    res.json(f);
})

async function getDocs(){
    var alldocs = fs.readdirSync(basedocsdir, {withFileTypes:true});
    alldocs = alldocs.filter(dirent => dirent.isFile()).map(dirent=>dirent.name);
    var retobj = [];
    alldocs.forEach(async (d)=>{
        //console.log(d);
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

module.exports = router;