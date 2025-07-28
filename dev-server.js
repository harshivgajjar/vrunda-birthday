// Local development server that mimics Vercel serverless structure
const express = require('express');
const path = require('path');

// Import the serverless function
const apiHandler = require('./api/index.js');

const app = express();

// Serve static files
app.use(express.static('.'));

// Use the API handler directly (it's already an Express app)
app.use('/', apiHandler);

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Development server running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
}); 