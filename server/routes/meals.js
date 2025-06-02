// routes/meals.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const { basemealsdir } = require('../utils/fileUtils'); // Import basemealsdir

router.post("/", (req, res) => {
    const meals = req.body;
    fs.writeFileSync(basemealsdir + "grocerylist.json", JSON.stringify(meals));
    res.json(meals);
});

router.get("/grocerylist", (req, res) => {
    fs.readFile(basemealsdir + "grocerylist.json", 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to read grocery list." });
        }
        try {
            const dataj = JSON.parse(data);
            res.json(dataj);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to parse grocery list data." });
        }
    });
});

router.post("/groceryupdate", (req, res) => {
    fs.writeFileSync(basemealsdir + "grocerylist.json", JSON.stringify(req.body));
    res.json(req.body);
});

module.exports = router;