#!/usr/bin/env node

const express = require('express')
const router = express.Router();

const mailchimp = require("@mailchimp/mailchimp_marketing");
const env = require('dotenv').config({path:"../../.env"});
const path = require('path');
const fs = require('fs');
const basemealsdir = process.env.BASEMEALSDIR;

router.post("/",(req,res)=>{
    var meals = req.body;
    fs.writeFileSync(basemealsdir+"grocerylist.json",JSON.stringify(meals));
    res.json(meals);
})
router.get("/grocerylist",(req,res)=>{
    fs.readFile(basemealsdir+"grocerylist.json",'utf-8',(err,data)=>{
        if(err){console.log(err)}
        try{
            var dataj = JSON.parse(data);
        }
        catch(err){
            console.log(err);
        }
        res.json(dataj)
    })
})
// app.get("/mailchimp",async (req,res)=>{
//     res.json(await getCampaigns());
// })
router.post("/groceryupdate",(req,res)=>{
    fs.writeFileSync(basemealsdir+"grocerylist.json",JSON.stringify(req.body))
    res.json(req.body)
})




module.exports = router;