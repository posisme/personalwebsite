#!/usr/bin/env node

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
const im = require('imagemagick');
global.isRebuildRunning = false;
const rebuildPhotoDb = async () =>{
    if(global.isRebuildRunning){
        console.log("already running");
        return;
    }
    global.isRebuildRunning = "0 of unknown";
    console.log("rebuilding pics");
    let retjson=[];
    var allfiles = fs.readdirSync(basepicdir+"highres/", {withFileTypes:true})
            .filter(dirent => dirent.isFile())
            .filter(dirent => dirent.name.match(/\.(jpg|jpeg)/))
            .map(dirent => dirent.name);
    allfiles = allfiles.map(fileName =>({
        name:fileName,
        time:fs.statSync(path.join(basepicdir+"highres/",fileName)).mtime.getTime()
    }))
    .sort((a,b)=>b.time - a.time)
    .map(file=>file.name);
    
        
    await dbrun("drop table if exists pics",null,"drop");
    await dbrun("drop table if exists picspeople",null,"drop");
    await dbrun("create table pics (id integer primary key autoincrement,filename,date)",null,"create");
    await dbrun("create table picspeople (id integer primary key autoincrement,picid, personid)",null,"create");
    
    //allfiles = ["AtticusSeniorPhotos-53.jpg","20230603_124844.jpg","teeter totter.jpg"]
    //allfiles = allfiles.slice(0,100);
    for(i=0;i<allfiles.length;i++){ 
        global.isRebuildRunning = `${i} of ${allfiles.length}`;
        //console.log(i);
        var b = fs.readFileSync(basepicdir+"highres/"+allfiles[i]);
        var s = fs.statSync(basepicdir+"highres/"+allfiles[i]);
        var t = saveThumb(allfiles[i]);
        var j = saveLowRes(allfiles[i]);
        await dbrun("insert into pics (filename,date) values (?,?)",[allfiles[i],s.birthtime],"insert");
        try {
            var f = ExifReader.load(b, {expanded:true,includeUnknown:true});
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
    console.log("done rebuilding");
    global.isRebuildRunning = false;
    return retjson;
}


const dbImg = async (img) =>{
    var deets = await ExifReader.load(basepicdir+"highres/"+img.filename, {expanded:true});
    
    // deets.thumbnailpic = await imagemagick.convert({
    //     srcData:fs.readFileSync(basepicdir+img.filename),
    //     width:100,
    //     height:100,
    //     resize:"fit",
    //     format:"PNG"
    //     });
    deets.people = img.people;
    return {filename:img.filename,data:deets};
}

const writeExif = async (img, tags,archivepath) =>{
    try{
        await exiftool.write(basepicdir+"highres/"+img,tags).then(()=>{console.log("writing tags");}).finally(()=>{
            
            console.log("written");
        });
        try{
            fs.renameSync(basepicdir+"highres/"+img+"_original",archivepath+img+"_original");
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

const saveThumb = async (imgfile) =>{
    try{
    if(!fs.existsSync(basepicdir+"thumbs/"+imgfile)){
        var b = await imagemagick.convert({
            srcData:fs.readFileSync(basepicdir+"highres/"+imgfile),
            width:100,
            height:100,
            resize:"fit",
            format:"PNG"
            });
        if(b){
            fs.writeFile(basepicdir+"thumbs/"+imgfile, b, (err)=>{
                if (err){
                    console.log(err);
                }
                else{
                    console.log("file saved")
                }
            })
        }
    }
    return "done"
    
    }
    catch(err){
        console.log(err);
    }
}
const saveLowRes = async (imgfile) =>{
    try{
        if(!fs.existsSync(basepicdir+"lowres/"+imgfile)){
            
            var b = await imagemagick.convert({
                srcData:fs.readFileSync(basepicdir+"highres/"+imgfile),
                width:1200,
                resize:"fit",
                format:"JPEG"
            })
            if(b){
                fs.writeFileSync(basepicdir+"lowres/"+imgfile,b,(err)=>{
                    if(err)
                        console.log(err)
                    else
                        console.log("file saved")
                })
            }
            
            
        }
    }
    catch(err){
        console.log(err);
    }
}

module.exports = {rebuildPhotoDb,dbImg,writeExif};