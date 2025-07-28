// Load environment variables from .env file
require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);

// Vercel serverless function handler
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const User = require('../models/User');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true
}));

// Session configuration for serverless
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Connect to MongoDB only if MONGO_URI is available
let mongoConnected = false;
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('MongoDB connected');
        mongoConnected = true;
        ensureDefaultUser();
    }).catch(err => {
        console.error('MongoDB connection error:', err);
        mongoConnected = false;
    });
} else {
    console.log('MONGO_URI not found, running without database');
    mongoConnected = false;
}

// Create default user if not exists
async function ensureDefaultUser() {
    if (!mongoConnected) return;
    try {
        const user = await User.findOne({ username: 'vuvu' });
        if (!user) {
            const hash = await bcrypt.hash('vuvu+nonsense', 10);
            await User.create({ username: 'vuvu', password: hash });
            console.log('Default user created');
        }
    } catch (error) {
        console.error('Error ensuring default user:', error);
    }
}

// Auth routes
app.post('/api/login', async (req, res) => {
    try {
        if (!mongoConnected) {
            return res.status(500).json({ message: 'Database not connected. Please check your MONGO_URI environment variable.' });
        }
        
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
        req.session.user = { id: user._id, username: user.username };
        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logged out' });
    });
});

app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, username: req.session.user.username });
    } else {
        res.json({ authenticated: false });
    }
});

app.get('/api/analytics', (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });
    res.json({ message: 'You are authenticated and can access analytics.' });
});

// Google Photos scraping endpoint
app.get('/api/photos/scrape', async (req, res) => {
    try {
        console.log('Attempting to scrape Google Photos album: https://photos.app.goo.gl/u8TTaxCNTvoktUCX6');
        
        const albumUrl = 'https://photos.app.goo.gl/u8TTaxCNTvoktUCX6';
        
        // Try multiple approaches to scrape the photos
        let photos = [];
        
        try {
            const response = await axios.get(albumUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                },
                timeout: 10000
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            const $ = cheerio.load(response.data);
            
            // Function to improve image quality by modifying Google Photos URLs
            function improveImageQuality(url) {
                if (!url || !url.includes('googleusercontent.com')) return url;
                
                // Extract the base URL without any size parameters
                let baseUrl = url;
                
                // Remove all size and quality parameters
                baseUrl = baseUrl.replace(/=w\d+-h\d+-c-k-no/, '');
                baseUrl = baseUrl.replace(/=w\d+-h\d+-c-k/, '');
                baseUrl = baseUrl.replace(/=w\d+-h\d+/, '');
                baseUrl = baseUrl.replace(/=w\d+/, '');
                baseUrl = baseUrl.replace(/=h\d+/, '');
                baseUrl = baseUrl.replace(/=c-k-no/, '');
                baseUrl = baseUrl.replace(/=c-k/, '');
                baseUrl = baseUrl.replace(/=k-no/, '');
                baseUrl = baseUrl.replace(/=k/, '');
                baseUrl = baseUrl.replace(/=no/, '');
                
                // Remove any query parameters
                baseUrl = baseUrl.split('?')[0];
                
                // Add parameters for maximum quality
                return baseUrl + '=w0-h0';
            }
            
            // Multiple selectors to find images
            const selectors = [
                'img[src*="googleusercontent.com"]',
                'img[data-src*="googleusercontent.com"]',
                'img[src*="lh3.googleusercontent.com"]',
                'img[data-src*="lh3.googleusercontent.com"]',
                'img[src*="lh4.googleusercontent.com"]',
                'img[data-src*="lh4.googleusercontent.com"]',
                'img[src*="lh5.googleusercontent.com"]',
                'img[data-src*="lh5.googleusercontent.com"]',
                'img[src*="lh6.googleusercontent.com"]',
                'img[data-src*="lh6.googleusercontent.com"]'
            ];
            
            selectors.forEach(selector => {
                $(selector).each((index, element) => {
                    const src = $(element).attr('src') || $(element).attr('data-src');
                    const alt = $(element).attr('alt') || 'Photo';
                    
                    if (src && !photos.some(p => p.url === src)) {
                        const improvedUrl = improveImageQuality(src);
                        photos.push({
                            id: photos.length + 1,
                            title: alt,
                            url: improvedUrl,
                            originalUrl: src,
                            date: 'From your album',
                            size: 'High Quality',
                            description: `Photo from your Google Photos album - ${alt}`
                        });
                    }
                });
            });
            
            // Also try to find any script tags that might contain photo data
            $('script').each((index, element) => {
                const scriptContent = $(element).html();
                if (scriptContent && scriptContent.includes('googleusercontent.com')) {
                    const matches = scriptContent.match(/https:\/\/[^"'\\s]+googleusercontent\.com[^"'\\s]+/g);
                    if (matches) {
                        matches.forEach((url, urlIndex) => {
                            if (!photos.some(p => p.url === url)) {
                                const improvedUrl = improveImageQuality(url);
                                photos.push({
                                    id: photos.length + 1,
                                    title: `Photo ${photos.length + 1}`,
                                    url: improvedUrl,
                                    originalUrl: url,
                                    date: 'From your album',
                                    size: 'High Quality',
                                    description: `Photo from your Google Photos album`
                                });
                            }
                        });
                    }
                }
            });
            
            console.log(`Found ${photos.length} photos using various methods`);
            
            if (photos.length > 0) {
                console.log('Successfully extracted photos from album');
                res.json({
                    success: true,
                    photos: photos,
                    total: photos.length,
                    albumUrl: albumUrl
                });
            } else {
                console.log('No photos found in album');
                res.json({
                    success: false,
                    message: 'No photos found in album',
                    photos: []
                });
            }
            
        } catch (scrapeError) {
            console.error('Error scraping Google Photos:', scrapeError);
            res.json({
                success: false,
                message: 'Error scraping Google Photos',
                photos: []
            });
        }
        
    } catch (error) {
        console.error('Photos scrape endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            photos: []
        });
    }
});

// Initialize default user
if (mongoConnected) {
    ensureDefaultUser();
}

// Export for Vercel
module.exports = app; 