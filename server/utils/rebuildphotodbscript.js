const {rebuildPhotoDb} = require("./sharedutils");
const main = async ()=>{
    var rebuild = await rebuildPhotoDb();
    console.log(rebuild);
}
main();