const {dbrun,dbImg,basepicdir} = require("./sharedutils");
const ExifReader = require('exifreader');
const fs = require('fs');
const path = require('path');
const folderPath = "/data/photoupload/upload";

fs.watch(folderPath, {recursive:true}, (eventType,filename)=>{
    if(eventType == "rename" && filename.match(/^[^\.][^\.]+\.(jpg|jpeg|png)$/)){
        
        try{
            var b = fs.readFileSync(basepicdir+filename);
            if(b){
                newImg(b,filename);
            }
        } 
        catch(error){
            console.log("watch error");
        }
    }
    else{
        console.log("missed",eventType,filename)
    }
})
const newImg = async (b,filename) =>{
        var pic = await dbrun("select * from pics where filename = ?",[filename],"select");
        
        if (pic && pic.length > 0){
            console.log(`${filename} already exists`);
            return false;
        }
        else{
            await readPic(b,filename);
        }
        


    };
const readPic = async (b,filename) =>{
    await dbrun("insert into pics (filename) values (?)",[filename],"insert");
    
    try {
        var f = ExifReader.load(b, {expanded:true,includeUnknown:true});
        if(f && f.iptc && f.iptc.Keywords && f.iptc.Keywords.length){
            f.iptc.Keywords.forEach((k)=>{
                dbrun("insert into picspeople (picid,personid) values (?,?)",[filename,k.description],"insert")
                .catch((e)=>{console.log("err",e)})
            }
        )}
    
        
    } catch (error) {
        var t = "blah"
        console.log("exifreader error")
    }
}
    
    

console.log("Monitoring...")