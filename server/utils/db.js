// utils/db.js
const sqlite3 = require('sqlite3').verbose(); // Assuming you're using sqlite3
const path = require('path');

// Assuming your DB connection logic is within dbrun, modify as needed
const dbPath = path.resolve(__dirname, '../db/personalsite.db'); // Adjust path to your database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});


// Your dbrun function from sharedutils
const dbrun = (sql, params, type) => {
    return new Promise((resolve, reject) => {
        if (type === "select" || type === "keyval") {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (type === "keyval") {
                        const result = {};
                        rows.forEach(row => {
                            result[row.key] = row.val;
                        });
                        resolve(result);
                    } else {
                        resolve(rows);
                    }
                }
            });
        } else if (type === "insert" || type === "update" || type === "delete") {
            db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes, lastID: this.lastID });
                }
            });
        } else {
            reject(new Error("Invalid DB operation type"));
        }
    });
};


// Your dbImg function from sharedutils (if it involves DB access)
// Placeholder for dbImg - replace with your actual implementation
const dbImg = async ({ filename }, { width, height }) => {
    // This is a placeholder. Your actual implementation would generate/fetch image data.
    // For now, let's assume it reads from a basepicdir and resizes or serves.
    const basepicdir = process.env.BASEPICDIR; // Assuming this is defined in .env
    const sharp = require('sharp'); // Install sharp: npm install sharp

    const filePath = path.join(basepicdir, filename);

    if (!fs.existsSync(filePath)) {
        return null; // Or handle error appropriately
    }

    try {
        let image = sharp(filePath);
        if (width || height) {
            image = image.resize(width, height);
        }
        const buffer = await image.toBuffer();
        return `data:image/jpeg;base64,${buffer.toString('base64')}`; // Or appropriate MIME type
    } catch (error) {
        console.error(`Error processing image ${filename}:`, error);
        return null;
    }
};

// You might also want to export the basepicdir if it's used elsewhere
const basepicdir = process.env.BASEPICDIR; // Assuming this is defined in .env

module.exports = {
    dbrun,
    dbImg,
    basepicdir,
    // You can export the db instance itself if needed for more direct operations
};