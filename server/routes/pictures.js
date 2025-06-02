// routes/pictures.js
const express = require('express');
const router = express.Router();
const { dbrun, dbImg, basepicdir } = require('../utils/db');
const { rebuildPhotoDb, writeExif } = require('../utils/sharedUtils');
const fs = require('fs'); // Only if needed directly, e.g., for fs.readFileSync for direct serving

// The nginx redirects anything /api to this servers / endpoint, so though it is going to /api, this
// endpoint is just /
router.get("/rebuildpics", async (req, res) => {
    let retjson = await rebuildPhotoDb();
    res.json(retjson);
});

router.get("/", async (req, res) => {
    const andorbool = req.query.andorbool ? req.query.andorbool : "or";
    let sql = "SELECT *, Max(CASE WHEN key = 'fav' AND val = 'true' THEN 'true' ELSE 'false' END) AS fav, GROUP_CONCAT(personid) AS people FROM pics LEFT JOIN picspeople ON picid = filename LEFT JOIN pics_xtra USING(filename)";

    const sqlp = [];
    const wherec = [];
    const havingc = [];

    if (req.query.person) {
        let sqlandor;
        if (andorbool === "or") {
            sqlandor = "personid IN (" + req.query.person.split(",").map(() => "?").join(", ") + ")";
            sqlp.push(...req.query.person.split(","));
            wherec.push(sqlandor);
        } else {
            sqlandor = req.query.person.split(",").map(() => "people LIKE ?").join(" AND ");
            sqlp.push(...req.query.person.split(",").map((e) => "%" + e + "%"));
            havingc.push(sqlandor);
        }
    }

    if (req.query.authtf && req.query.authtf === "false") {
        havingc.push("fav = 'true'");
    }

    sql = sql + (wherec.length > 0 ? " WHERE " + wherec.join(" AND ") : "");
    sql += " GROUP BY filename ";
    sql = sql + (havingc.length > 0 ? " HAVING " + havingc.join(" AND ") : "");
    sql += " ORDER BY fav DESC, date DESC ";

    const total = await dbrun(sql, sqlp, "select");
    sql = sql + "LIMIT " + req.query.max_rows + " OFFSET " + req.query.offset;
    console.log(sql, sqlp);
    let listiles = await dbrun(sql, sqlp, "select");

    listiles = listiles.map((f) => {
        return { filename: f.filename, data: { people: f.people, fav: f.fav } };
    });

    let allpeepssql = "SELECT DISTINCT personid, COUNT(personid) AS ct FROM picspeople GROUP BY personid ORDER BY ct DESC";
    if (req.query.authtf && req.query.authtf === "false") {
        allpeepssql = 'SELECT DISTINCT personid, COUNT(personid) AS ct FROM pics_xtra JOIN picspeople ON picid = filename WHERE key = "fav" AND val = "true" GROUP BY personid ORDER BY ct DESC';
    }
    const allpeeps = await dbrun(allpeepssql, [], "select");

    res.json({
        count: 15, // This seems hardcoded, consider making it dynamic
        allpeeps: allpeeps,
        offset: req.query.offset,
        total: total.length,
        files: listiles
    });
});

router.get("/picture", async (req, res) => {
    const pic = await dbImg({ filename: req.query.picture }, { width: req.query.width, height: req.query.width });
    const attrs = await dbrun("SELECT key, val FROM pics_xtra WHERE filename = ?", [req.query.picture], "keyval");

    res.json({
        data: pic,
        allpeople: await dbrun("SELECT DISTINCT personid FROM picspeople GROUP BY personid ORDER BY COUNT(personid) DESC", [], "select"),
        attrs: attrs,
    });
});

router.post("/updatepics", async (req, res) => {
    // delete old people entries
    await dbrun("DELETE FROM picspeople WHERE picid = ?", [req.body.filename], "delete");

    let people = [];
    // Collect tagged people from dynamic keys
    for (const key in req.body) {
        if (key.match(/^taggedPeople-/)) {
            people.push(req.body[key]);
        }
    }

    // Add people from the whoBox if present
    if (typeof req.body.whoBox === "string" && req.body.whoBox !== "") {
        const peoplesplit = req.body.whoBox.split(/[\n,]/).map(f => f.trim()).filter(f => f); // Filter empty strings
        people = [...new Set([...people, ...peoplesplit])]; // Combine and remove duplicates
    }

    // Insert new people entries
    for (const person of people) {
        await dbrun("INSERT INTO picspeople (personid, picid) VALUES (?,?)", [person, req.body.filename], "insert");
    }

    // Write EXIF data (Keywords)
    await writeExif(req.body.filename, { "Keywords": people }, basepicdir + "archive/"); // Ensure this path is correct

    res.json({ filename: req.body.filename, people: people }); // Return updated data
});

router.get("/picfav", async (req, res) => {
    const { filename, fav } = req.query;
    let currfav = await dbrun("SELECT key, val FROM pics_xtra WHERE filename = ? AND key = 'fav'", [filename], "select");

    if (currfav && currfav.length > 0) {
        await dbrun("UPDATE pics_xtra SET val = ? WHERE filename = ? AND key = 'fav'", [fav.toString(), filename], "update");
    } else {
        await dbrun("INSERT INTO pics_xtra (filename, key, val) VALUES (?, 'fav', ?)", [filename, fav], "insert");
    }
    res.json({ fav: fav });
});

module.exports = router;