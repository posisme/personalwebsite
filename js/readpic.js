const tfnode = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const fs = require('fs');

function predictImage(path){
    return imageClassification(path);
}
const readImage = path =>{
    const ib = fs.readFileSync(path);
    const tfimg = tfnode.node.decodeImage(ib);
    return tfimg;
}

const imageClassification = async path => {
    const image = readImage(path);
    // Load the model.
    const mobilenetModel = await mobilenet.load();
    // Classify the image.
    const predictions = await mobilenetModel.classify(image);
    console.log('Classification Results:', predictions);
}


module.exports = {predictImage}