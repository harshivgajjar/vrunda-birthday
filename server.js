// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:8000', // adjust if needed
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 