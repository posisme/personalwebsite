#!/usr/bin/env node

const express = require('express')
const router = express.Router();
const fs = require('fs');


router.get("/", (req,res)=>{
    console.log(req.query)
    res.json(req.query);
})



module.exports = router;