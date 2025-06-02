// auth.js
const bearerToken = require('bearer-token');
const bcrypt = require('bcrypt');
const { dbrun } = require('./utils/db'); // Import dbrun

const saltRounds = 10; // Define saltRounds here if used for hashing in auth routes

const isValidApikey = async (apikey) => {
    try {
        const hashedkeys = await dbrun("select api_key from api_keys", [], "select");
        for (let i = 0; i < hashedkeys.length; i++) {
            const b = await bcrypt.compare(apikey, hashedkeys[i].api_key);
            if (b) {
                return true;
            }
        }
    } catch (error) {
        console.error("ERROR checking API key:", error);
        return false;
    }
    return false;
};

const authenticate = (req, res, next) => {
    const origin = req.headers.referer;
    const host = req.headers.host;

    // Allow requests from the same domain or specific whitelisted origins
    if (origin && host && (new URL(origin).host === host || new URL(origin).host === "posis.me")) {
        next();
        return;
    }
    // Allow specific IP address (e.g., localhost/internal access)
    else if (!origin || origin === "") {
        if (req.headers['x-forwarded-for'] === '204.144.226.188') {
            next();
            return;
        }
    }

    // Process bearer token for API key authentication
    bearerToken(req, async (err, token) => {
        if (err) {
            return res.status(501).json({ error: "Auth error." });
        }
        if (!token) {
            return res.status(401).json({ error: "No Token Provided" });
        }
        if (!await isValidApikey(token)) {
            return res.status(403).json({ error: "Invalid API token" });
        }
        next();
    });
};

module.exports = {
    authenticate,
    isValidApikey,
    saltRounds // Export if needed by auth routes for hashing
};