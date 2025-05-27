const express = require('express');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname)));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Main route - redirect to GUILTY game
app.get('/', (req, res) => {
    console.log('Serving guilty-game-v5-themed.html');
    res.sendFile(path.join(__dirname, 'guilty-game-v5-themed.html'));
});

// Add route for GUILTY v3 (cleaned up version)
app.get('/guilty-v3', (req, res) => {
    console.log('Serving guilty-game-v5-themed.html');
    const filePath = path.join(__dirname, 'guilty-game-v5-themed.html');
    console.log('File path:', filePath);
    res.sendFile(filePath);
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`GUILTY game running on port ${PORT}`);
    console.log('Available routes:');
    console.log('  / - GUILTY v3 (with dev mode fixes)');
    console.log('  /guilty-v3 - GUILTY v3 with beta testing');
}); 