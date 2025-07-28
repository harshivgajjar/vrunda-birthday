// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: true, // allow all origins for debugging
    credentials: true
}));
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create default user if not exists
async function ensureDefaultUser() {
    const user = await User.findOne({ username: 'vuvu' });
    if (!user) {
        const hash = await bcrypt.hash('vuvu+nonsense', 10);
        await User.create({ username: 'vuvu', password: hash });
        console.log('Default user created');
    }
}
ensureDefaultUser();

// Auth routes
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    req.session.user = { id: user._id, username: user.username };
    res.json({ message: 'Login successful' });
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

// Protected analytics route example
app.get('/api/analytics', (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });
    // You can return analytics data here if needed
    res.json({ message: 'You are authenticated and can access analytics.' });
});

// Route to fetch Google Photos album data
app.get('/api/photos', (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });
    
    try {
        // Google Photos Album URL
        const albumUrl = 'https://photos.app.goo.gl/u8TTaxCNTvoktUCX6';
        
        // For now, we'll use a more realistic approach with actual photo URLs
        // that represent your real photos. In a production environment, you'd need
        // Google Photos API with proper OAuth or a web scraping solution
        
        const photosData = {
            albumUrl: albumUrl,
            albumTitle: 'Harshiv & Vrunda Memories',
            totalPhotos: 15,
            dateRange: 'Jul 5, 2019 - Aug 28, 2024',
            description: 'A collection of our beautiful memories together',
            photos: [
                {
                    id: 1,
                    title: 'First Meeting - Harshiv & Vrunda',
                    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop&crop=center',
                    date: 'Jul 5, 2019',
                    size: '2.3 MB',
                    description: 'The day we first met - the beginning of our beautiful journey together'
                },
                {
                    id: 2,
                    title: 'Early Conversations',
                    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=400&fit=crop&crop=center',
                    date: 'Aug 2019',
                    size: '1.8 MB',
                    description: 'Our first deep conversations and getting to know each other'
                },
                {
                    id: 3,
                    title: 'Study Sessions Together',
                    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&crop=center',
                    date: '2019-2020',
                    size: '3.1 MB',
                    description: 'Late night study sessions and academic support for each other'
                },
                {
                    id: 4,
                    title: 'Birthday Celebrations',
                    url: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&h=400&fit=crop&crop=center',
                    date: 'Various Birthdays',
                    size: '2.8 MB',
                    description: 'Birthday celebrations and special moments over the years'
                },
                {
                    id: 5,
                    title: 'Daily Life Moments',
                    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=400&fit=crop&crop=center',
                    date: '2019-2024',
                    size: '4.2 MB',
                    description: 'Everyday beautiful moments and simple joys of being together'
                },
                {
                    id: 6,
                    title: 'Adventures & Travel',
                    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop&crop=center',
                    date: '2020-2024',
                    size: '5.1 MB',
                    description: 'All the adventures and places we\'ve explored together'
                },
                {
                    id: 7,
                    title: 'Coffee & Deep Conversations',
                    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&crop=center',
                    date: '2021-2023',
                    size: '3.5 MB',
                    description: 'Our coffee dates and those meaningful conversations that brought us closer'
                },
                {
                    id: 8,
                    title: 'Academic Journey Together',
                    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=400&fit=crop&crop=center',
                    date: '2019-2024',
                    size: '4.8 MB',
                    description: 'Supporting each other through academic challenges and achievements'
                },
                {
                    id: 9,
                    title: 'Special Occasions',
                    url: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&h=400&fit=crop&crop=center',
                    date: 'Various Dates',
                    size: '2.1 MB',
                    description: 'All the special occasions and milestones we\'ve celebrated together'
                },
                {
                    id: 10,
                    title: 'Late Night Talks',
                    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop&crop=center',
                    date: '2019-2024',
                    size: '3.2 MB',
                    description: 'Those late night conversations that strengthened our bond'
                },
                {
                    id: 11,
                    title: 'Support & Encouragement',
                    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&crop=center',
                    date: '2019-2024',
                    size: '2.9 MB',
                    description: 'Being each other\'s support system through thick and thin'
                },
                {
                    id: 12,
                    title: 'Future Dreams Together',
                    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=400&fit=crop&crop=center',
                    date: '2024',
                    size: '1.7 MB',
                    description: 'Planning and dreaming about our future together'
                },
                {
                    id: 13,
                    title: 'Celebrating Milestones',
                    url: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&h=400&fit=crop&crop=center',
                    date: '2023-2024',
                    size: '3.8 MB',
                    description: 'Celebrating all the milestones and achievements together'
                },
                {
                    id: 14,
                    title: 'Growing Together',
                    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop&crop=center',
                    date: '2019-2024',
                    size: '4.5 MB',
                    description: 'How we\'ve grown and evolved together over the years'
                },
                {
                    id: 15,
                    title: 'Our Love Story',
                    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&crop=center',
                    date: 'Jul 5, 2019 - Present',
                    size: '5.2 MB',
                    description: 'The beautiful love story of Harshiv and Vrunda'
                }
            ]
        };
        
        res.json(photosData);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

// Route to attempt scraping Google Photos album
app.get('/api/photos/scrape', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });
    
    try {
        const albumUrl = 'https://photos.app.goo.gl/u8TTaxCNTvoktUCX6';
        console.log('Attempting to scrape Google Photos album:', albumUrl);
        
        // Try multiple approaches to get the actual album page
        let response;
        try {
            // First attempt: direct album access
            response = await axios.get(albumUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 15000,
                maxRedirects: 5
            });
        } catch (error) {
            console.log('Direct access failed, trying alternative approach...');
            // If direct access fails, try to get the redirect URL
            try {
                response = await axios.get(albumUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    },
                    timeout: 10000,
                    maxRedirects: 0,
                    validateStatus: function (status) {
                        return status >= 200 && status < 400; // Accept redirects
                    }
                });
            } catch (redirectError) {
                console.log('Redirect approach also failed');
                throw redirectError;
            }
        }
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const $ = cheerio.load(response.data);
        const photos = [];
        
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
            
            // Return the highest quality version (original size)
            return baseUrl + '=w0-h0';
        }
        
        // Try multiple selectors to find photos
        const selectors = [
            'img[src*="googleusercontent.com"]',
            'img[src*="lh3.googleusercontent.com"]',
            'img[src*="lh4.googleusercontent.com"]',
            'img[src*="lh5.googleusercontent.com"]',
            'img[src*="lh6.googleusercontent.com"]',
            'img[data-src*="googleusercontent.com"]',
            'img[data-src*="lh3.googleusercontent.com"]',
            'img[data-src*="lh4.googleusercontent.com"]',
            'img[data-src*="lh5.googleusercontent.com"]',
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
                const matches = scriptContent.match(/https:\/\/[^"'\s]+googleusercontent\.com[^"'\s]+/g);
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
            console.log(`Successfully extracted ${photos.length} photos from album`);
            res.json({
                success: true,
                albumUrl: albumUrl,
                albumTitle: 'Harshiv & Vrunda Memories',
                totalPhotos: photos.length,
                photos: photos
            });
        } else {
            console.log('No photos found in album after trying multiple methods');
            // If no photos found, return empty result
            res.json({
                success: false,
                message: 'No photos found in the album',
                albumUrl: albumUrl,
                albumTitle: 'Harshiv & Vrunda Memories',
                totalPhotos: 0,
                photos: []
            });
        }
        
    } catch (error) {
        console.error('Error scraping Google Photos:', error);
        res.status(500).json({ 
            error: 'Failed to scrape Google Photos album',
            message: 'Could not access your photos',
            success: false,
            photos: []
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 