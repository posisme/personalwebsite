// utils/fileUtils.js
const fs = require('fs');
const path = require('path');

const basedocsdir = process.env.BASEDOCDIR;
const basemddir = process.env.BASEMDDIR;
const basemealsdir = process.env.BASEMEALSDIR;

async function getDocs() {
    const alldocs = fs.readdirSync(basedocsdir, { withFileTypes: true });
    const fileNames = alldocs.filter(dirent => dirent.isFile()).map(dirent => dirent.name);
    const retobj = [];

    for (const d of fileNames) { // Use for...of for async/await if needed inside loop
        const filePath = path.join(basedocsdir, d);
        const td = fs.readFileSync(filePath, 'utf8'); // Read as UTF-8 directly
        let title = "";

        if (td.match(/^#[\s]*[\*]*([^\*]*)[\*]*\n/)) {
            title = td.match(/^#[\s]*[\*]*([^\*]*)[\*]*\n/)[1].trim(); // Trim whitespace
        } else {
            title = d;
        }
        retobj.push({ title: title, link: d });
    }
    return retobj;
}

module.exports = {
    getDocs,
    basedocsdir,
    basemddir,
    basemealsdir
};