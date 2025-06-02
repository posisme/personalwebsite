// routes/docs.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const { getDocs, basemddir } = require('../utils/fileUtils'); // Import from fileUtils

router.get("/", async (req, res) => {
    res.json({err:"err"})
});
router.get("/getdocs",async (req,res)=>{
    const docs = await getDocs();
    res.json({ data: docs });
})
router.get("/mdviewer", (req, res) => {
    const retjson = { file: "" };
    const fp = req.query.filepath !== "null" ? req.query.filepath : "/";
    if (req.query.doc) {
        const filePath = basemddir + "/" + decodeURIComponent(req.query.doc);
        try {
            const f = fs.readFileSync(filePath, 'utf8');
            retjson.file = f;
        } catch (err) {
            console.error("Error reading markdown file:", err);
            return res.status(404).json({ error: "File not found or unreadable." });
        }
    } else {
        try {
            retjson.filelist = fs.readdirSync(basemddir + fp).filter(file => !file.startsWith('.'));
        } catch (err) {
            console.error("Error reading markdown directory:", err);
            return res.status(500).json({ error: "Failed to list markdown files." });
        }
    }
    res.json(retjson);
});

router.post("/mdpost", (req, res) => {
    if (req.body.filename && req.body.content !== undefined) { // Check for content presence
        try {
            const filePath = basemddir + "/" + req.body.filename;
            fs.writeFileSync(filePath, req.body.content);
            res.json({ message: "File saved successfully." }); // Return a success message
        } catch (err) {
            console.error("Error writing markdown file:", err);
            res.status(500).json({ error: "Failed to write markdown file." });
        }
    } else {
        res.status(400).json({ error: "Filename and content are required." });
    }
});

module.exports = router;