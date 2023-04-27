const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();


app.use(bodyParser.urlencoded({ extended: true }));
require('dotenv').config();

const dashboard = require('./dashboard')
app.use(express.json());

const session = require('express-session');
const sqlitestore = require('better-sqlite3');
const SqliteStore = require("better-sqlite3-session-store")(session);
var sessargs = {};
if (process.env.NODE_ENV === 'development' && process.env.LOG_LEVEL=='debug') {
    sessargs = {verbose:console.log};
}
const dbss = new sqlitestore("./db/sess.db",sessargs);


const passport = require('passport')

const GoogleStrategy = require('passport-google-oauth2').Strategy;

//Middleware
app.use(session({
    secret: process.env['SESSION_SECRET'],
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 },
    store: new SqliteStore({
        client:dbss,
        expired:{
            clear:true,
            intervalMs:900000
        }
    })
    
}))

app.use(passport.initialize()) // init passport on every route call
app.use(passport.session())    //allow passport to use "express-session"
app.use(dashboard)

//Get the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from Google Developer Console
const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID']
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET']

authUser = (request, accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}

//Use "GoogleStrategy" as the Authentication Strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
}, authUser));


passport.serializeUser((user, done) => {
    //console.log(`\n--------> Serialize User:`)
    //console.log(user)
    // The USER object is the "authenticated user" from the done() in authUser function.
    // serializeUser() will attach this user to "req.session.passport.user.{user}", so that it is tied to the session object for each session.  
    
    done(null, user)
})


passport.deserializeUser((user, done) => {
    //console.log("\n--------- Deserialized User:")
    //console.log(user)
    // This is the {user} that was saved in req.session.passport.user.{user} in the serializationUser()
    // deserializeUser will attach this {user} to the "req.user.{user}", so that it can be used anywhere in the App.
    
    done(null, user)
})





//console.log() values of "req.session" and "req.user" so we can see what is happening during Google Authentication
let count = 1
showlogs = (req, res, next) => {
    console.log("\n==============================")
    console.log(`------------>  ${count++}`)

    console.log(`\n req.session.passport -------> `)
    console.log(req.session.passport)

    console.log(`\n req.user -------> `)
    console.log(req.user)

    console.log("\n Session and Cookie")
    console.log(`req.session.id -------> ${req.session.id}`)
    console.log(`req.session.cookie -------> `)
    console.log(req.session.cookie)

    console.log("===========================================\n")

    next()
}

//app.use(showlogs)


app.post('/auth/google',(req,res,next)=>passport.authenticate('google', {
        scope:['email', 'profile'],
        state: req.body.returnTo
    },()=>next())(req,res,next)
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login',
    }),(req,res)=>{
        if(req.query.state){
            res.redirect(req.query.state)
        }
        else{
            res.redirect("/")
        }
    });

//Define the Login Route
app.get("/login", (req, res) => {
    if(req.secure){
        res.render("pages/login",{returnTo:req.query.returnTo})
    }
    else{
        if(process.env.NODE_ENV == "production"){
            res.redirect("https://"+req.header('host')+"/login")
        }
        else if(process.env.NODE_ENV == "development"){
            res.render("pages/login",{returnTo:req.query.returnTo})
        }
    }
})


//Use the req.isAuthenticated() function to check if user is Authenticated


//Define the Logout
app.get("/logout", (req, res) => {
    req.logOut(
        res.redirect("/login")
    )
    console.log(`-------> User Logged out`)
})

module.exports = app;