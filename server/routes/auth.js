// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { dbrun } = require('../utils/db');
const { saltRounds } = require('../auth'); // Import saltRounds from auth.js

router.post("/setlogin", async (req, res) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            console.error("Error generating salt:", err);
            return res.status(500).json({ error: "Server error during password hashing." });
        }
        bcrypt.hash(req.body.password, salt, async (err, hash) => {
            if (err) {
                console.error("Error hashing password:", err);
                return res.status(500).json({ error: "Server error during password hashing." });
            }
            try {
                await dbrun("INSERT INTO authusers (username, hashepassword, name, email) VALUES (?,?,?,?)",
                    [
                        req.body.username,
                        hash,
                        req.body.name,
                        req.body.email
                    ],
                    "insert");
                res.json({ message: "User created successfully." });
            } catch (dbErr) {
                console.error("Error inserting user into DB:", dbErr);
                res.status(500).json({ error: "Failed to create user. Username might already exist." });
            }
        });
    });
});

router.post("/setapikey", async (req, res) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            console.error("Error generating salt for API key:", err);
            return res.status(500).json({ error: "Server error during API key hashing." });
        }
        bcrypt.hash(req.body.apikey, salt, async (err, hash) => {
            if (err) {
                console.error("Error hashing API key:", err);
                return res.status(500).json({ error: "Server error during API key hashing." });
            }
            try {
                await dbrun("INSERT INTO api_keys (api_key) VALUES (?)", [hash], "insert");
                res.json({ message: "API key created successfully." });
            } catch (dbErr) {
                console.error("Error inserting API key into DB:", dbErr);
                res.status(500).json({ error: "Failed to create API key." });
            }
        });
    });
});

router.post("/login", async (req, res) => {
    const user = await dbrun("SELECT username, hashepassword AS h, name, email FROM authusers WHERE username = ?", [req.body.username], "select");
    if (user && user.length) {
        bcrypt.compare(req.body.password, user[0].h, (err, result) => {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ error: "Authentication error." });
            }
            if (result) {
                console.log("Passwords match");
                res.json({ name: user[0].name, email: user[0].email });
            } else {
                console.log("Passwords don't match");
                res.status(401).json({ error: "Invalid username or password." });
            }
        });
    } else {
        console.log("No user found");
        res.status(401).json({ error: "Invalid username or password." });
    }
});

module.exports = router;