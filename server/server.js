#!/usr/bin/env node

const express = require("express");
const cors = require('cors');
const env = require('dotenv').config({ path: '../.env' });
const app = express();
const path = require('path');

const basemealsdir = process.env.BASEMEALSDIR;
const basemddir = process.env.BASEMDDIR;
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const https = require('https');
const bearerToken = require('bearer-token');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const authenticate = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
        return;
    }
    const origin = req.headers.referer;
    const host = req.headers.host;

    if (origin && host && (new URL(origin).host === host || new URL(origin).host == "posis.me")) {
        //console.log("Request from same domain");
        next();
        return;
    }
    else if (!origin || origin === "") {
        if (
            req.headers['x-forwarded-for'] === '204.144.226.188'
        ) {
            //console.log("Request from localhost, skipping authentication");
            next();
            return;
        }
    }
    bearerToken(req, async (err, token) => {

        if (err) {
            return res.status(501).json({ error: "Auth error." })
        }
        if (!token) {
            return res.status(401).json({ error: "No Token Provided" });
        }
        if (!await isValidApikey(token)) {
            return res.status(403).json({ error: "Invalid API token" });
        }
        next();


    })


}
const isValidApikey = async (apikey) => {
    try {
        const hashedkeys = await dbrun("select api_key from api_keys", [], "select");
        for (i = 0; i < hashedkeys.length; i++) {
            var b = await bcrypt.compare(apikey, hashedkeys[i].api_key);
            if (b) {
                return true;
            }
        }
    } catch (error) {
        console.error("ERROR", error);
        return false;
    }
    return false;

}


const { dbrun } = require("./utils/sharedutils");


app.use(express.json());

app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './db'
    }),
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    }
}));

app.use(authenticate);


app.use(cors({
    origin: 'https://posis.me'
}))

//the nginx redirects anything /api to this servers / endpoint, so though it is going to /api, this
//endpoint is just /

//routes 
const mailchimp = require("./routes/mailchimp");
app.use("/mailchimp", mailchimp);

const meals = require("./routes/meals")
app.use("/meals", meals);

const pictures = require("./routes/pictures");
app.use("/pictures", pictures);

const reading = require("./routes/reading");
app.use("/reading", reading);

const docs = require("./routes/docs");
app.use("/docs", docs);

// end routes

app.get("/", (req, res) => {
    res.json({ error: "no api selected" })
})
app.post("/setlogin", async (req, res) => {
    var ret;
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            // Handle error
            return;
        }
        bcrypt.hash(req.body.password, salt, (err, hash) => {

            if (err) {
                console.log("error in password", err);
                res.send({ "d": "error" });
            }
            dbrun("insert into authusers (username,hashepassword,name,email) values (?,?,?,?)",
                [
                    req.body.username,
                    hash,
                    req.body.name,
                    req.body.email
                ],
                "insert");
            res.send({ "d": "updated" });
        });
    });


})
app.post("/setapikey", async (req, res) => {
    var ret;
    console.log(req.body);
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            // Handle error
            return;
        }
        bcrypt.hash(req.body.apikey, salt, (err, hash) => {

            if (err) {
                console.log("error in password", err);
                res.send({ "d": "error" });
            }
            dbrun("insert into api_keys (api_key) values (?)",
                [
                    hash
                ],
                "insert");
            res.send({ "d": "updated" });
        });
    });


})
app.use('/login', async (req, res) => {
    var ret = "";
    var user = await dbrun("select username,hashepassword as h,name,email  from authusers where username = ?", [req.body.username], "select")
    if (user && user.length) {
        bcrypt.compare(req.body.password, user[0].h, (err, result) => {
            if (err) {
                console.log("error in compare", err);
                res.send({ "user": null })
                return;
            }
            if (result) {
                console.log("Passwords match");
                req.session.user = user[0];
                res.send({ "name": user[0].name, "email": user[0].email });
            }
            else {
                console.log("Passwords don't match");
                res.send({ "user": null })
            }
        })
    }
    else {
        console.log("no user found");
        res.send({ "user": null })
    }
});





app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.send({ message: 'Logged out successfully' });
    });
});

app.listen(6125, () => {
    console.log(`running on port 6125...`);
});
