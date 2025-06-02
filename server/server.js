#!/usr/bin/env node

const express = require("express");
const cors = require('cors');
const env = require('dotenv').config({ path: '../.env' }); // Adjust path if .env is not in parent
const path = require('path');
const cookieParser = require('cookie-parser'); // Add cookie-parser

const app = express();
const PORT = 6125; // Define port here

// Import authentication middleware
const { authenticate, isValidApikey } = require('./auth');

// Import routes
const mealsRoutes = require('./routes/meals');
const picturesRoutes = require('./routes/pictures');
const docsRoutes = require('./routes/docs');
const authRoutes = require('./routes/auth'); // For /login, /setlogin, /setapikey

// --- Global Middleware ---
app.use(express.json()); // For parsing application/json
app.use(cookieParser()); // For parsing cookies

// CORS configuration
// Ensure this is configured correctly for production.
// `Access-Control-Allow-Credentials` should be true if you're using cookies.
app.use(cors({
    origin: ['https://posis.me', 'http://localhost:3000'], // Allow multiple origins if needed
    credentials: true // Crucial for sending cookies
}));

// --- Authentication Middleware ---
// Apply authentication middleware to all routes except specific public ones
// You might want to make authenticate more granular depending on your needs.
app.use(authenticate);

// --- Routes ---
// Mount routes under specific paths
app.use('/meals', mealsRoutes);
app.use('/pictures', picturesRoutes);
app.use('/docs', docsRoutes);
app.use('/', authRoutes); // Auth routes often live at the root or /auth

// Example test route (can be removed later)
app.get("/test", (req, res) => {
    res.json({ hello: "hello" });
});

// Default fallback for unspecified API routes
app.get("/", (req, res) => {
    res.json({ error: "no api selected" });
});

// --- Server Start ---

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});