#!/usr/bin/env node

const express = require('express')
const router = express.Router();

const mailchimp = require("@mailchimp/mailchimp_marketing");
const env = require('dotenv').config({path:"../../.env"});
const path = require('path');
const fs = require('fs');
const baseemaildir = process.env.BASEEMAILDIR;
const {dbrun} = require("../utils/sharedutils");
const getKey = async ()=>{
    var r = await dbrun("select key from out_creds where service = 'mailchimp'",[],"select");
    return r[0].key;
}

const getFolders = async () =>{
    mailchimp.setConfig({
        apiKey:await getKey(),
        server: "us14",
    });
    const resp = await mailchimp.campaignFolders.list();
    console.log(resp);
}
// getFolders();
const getCampaigns = async () =>{
    mailchimp.setConfig({
        apiKey:await getKey(),
        server: "us14",
    });
    var g = getKey().then(r => console.log(r))
    var dt = new Date();
    dt.setDate(dt.getDate()-180);
    const resp = await mailchimp.campaigns.list({
        fields:["campaigns.settings.subject_line","campaigns.archive_url","campaigns.send_time","campaigns.settings.title"],
        status:"sent",
        sort_field:"send_time",
        since_send_time:dt.toISOString(),
        count:100,
        sort_dir:"DESC",
        folder_id:"58de07d031"
    });
    return resp;
}


router.get("/",async (req,res)=>{
    res.json(await getCampaigns());
})

module.exports = router;