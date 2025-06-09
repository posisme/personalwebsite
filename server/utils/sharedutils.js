#!/usr/bin/env node

const env = require('dotenv').config({path:"../../.env"});
const path = require('path');
const fs = require('fs');

const sqlite3 = require("sqlite3").verbose();
const basepicdir = process.env.BASEPICDIR;
const db = new sqlite3.Database(path.join(__dirname,"../db/personalsite.db"),(err)=>{
    if(err) {return console.error(err.message)};
    return db;
});

const dbrun = async (sql, params = [],crud)=>{
    //console.log(sql,params,crud);
    if(!crud){
        crud = "select";
    }
    if(crud == "update" || crud == "insert" || crud == "delete"){
        return new Promise((resolve, reject)=>{
            db.run(sql,params,(err,i)=>{
                if(err) reject(err);
                resolve({resolved:crud});

            })
        })
    }
    else if(crud == "select"){
        return new Promise((resolve, reject)=>{
            db.all(sql,params,(err,rows)=>{
                if(err) reject(err);
                resolve(rows);
            })
        })
    }
    else if(crud == "keyval"){
        return new Promise((resolve, reject)=>{
            db.all(sql,params,(err,rows)=>{
                if(err) reject(err);
                let nrows = {};
                rows.forEach((a)=>{nrows[a.key]=a.val});
                resolve(nrows);
            })
        })
    }
    else if(crud == "create" || crud=="drop"){
        return new Promise((resolve,reject)=>{
            db.exec(sql,(err)=>{
                if(err) reject({error:err});
                resolve({resolved:crud});
            });
        });
    }
}



module.exports ={dbrun};