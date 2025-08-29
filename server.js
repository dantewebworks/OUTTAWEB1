const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory user storage (in production, use a database)
let users = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@outtaweb.com',
        password: 'admin123',
        verified: true,
        createdAt: new Date().toISOString()
    }
];

// Simple session storage (in production, use Redis or database)
const sessions = {};

// Add your actual user account
users.push({
    id: 2,
    name: 'Dante',
    email: 'dantedesignzofficial@gmail.com',
    password: 'yourpassword123', // Change this to your actual password
    verified: true,
    createdAt: new Date().toISOString()
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            // Allow inline event handlers (onclick, etc.) used throughout the app
            scriptSrcAttr: ["'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://maps.googleapis.com", "https://cors-anywhere.herokuapp.com", "https://api.allorigins.win", "https://corsproxy.io", "https://thingproxy.freeboard.io"]
        }
    }
}));

// Enable CORS
app.use(cors());

// Compression middleware
app.use(compression());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (but do NOT auto-serve index.html for '/')
app.use(express.static(path.join(__dirname), { index: false }));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Outta Web API is running',
        timestamp: new Date().toISOString()
    });
});

// Authentication endpoints
app.get('/api/auth/default-credentials', (req, res) => {
    res.json({
        email: 'admin@outtaweb.com',
        password: 'admin123',
        message: 'Default admin credentials'
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user && user.password === password) {
        // Create session
        const sessionId = Math.random().toString(36).substring(2, 15);
        sessions[sessionId] = {
            userId: user.id,
            email: user.email,
            createdAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                verified: user.verified
            },
            sessionId: sessionId
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match'
        });
    }
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: 'An account with this email already exists'
        });
    }
    
    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        verified: true,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Create session
    const sessionId = Math.random().toString(36).substring(2, 15);
    sessions[sessionId] = {
        userId: newUser.id,
        email: newUser.email,
        createdAt: new Date().toISOString()
    };
    
    res.json({
        success: true,
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            verified: newUser.verified
        },
        sessionId: sessionId
    });
});

app.post('/api/auth/verify', (req, res) => {
    const { email, code } = req.body;
    
    // For simplicity, accept any 6-digit code
    if (code && code.length === 6) {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            user.verified = true;
            res.json({
                success: true,
                message: 'Email verified successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } else {
        res.status(400).json({
            success: false,
            message: 'Invalid verification code'
        });
    }
});

app.post('/api/auth/reset-request', (req, res) => {
    const { email } = req.body;
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        // Generate reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetCode = resetCode;
        
        res.json({
            success: true,
            message: 'Reset code sent',
            resetCode: resetCode // In production, send via email
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'No account found with this email'
        });
    }
});

app.post('/api/auth/reset-password', (req, res) => {
    const { email, code, newPassword, confirmNewPassword } = req.body;
    
    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match'
        });
    }
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.resetCode === code) {
        user.password = newPassword;
        delete user.resetCode;
        
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'Invalid reset code'
        });
    }
});

app.get('/api/auth/check-session', (req, res) => {
    const sessionId = req.headers['x-session-id'];
    
    if (sessionId && sessions[sessionId]) {
        const session = sessions[sessionId];
        const user = users.find(u => u.id === session.userId);
        
        if (user) {
            res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    verified: user.verified
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid session'
            });
        }
    } else {
        res.status(401).json({
            success: false,
            message: 'No valid session'
        });
    }
});

// Google Places API proxy endpoint
app.get('/api/places/search', async (req, res) => {
    try {
        const { query, key } = req.query;
        
        if (!query || !key) {
            return res.status(400).json({ 
                error: 'Missing required parameters: query and key' 
            });
        }

        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${key}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('Places API error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch places data',
            details: error.message 
        });
    }
});

// Google Places Details API proxy endpoint
app.get('/api/places/details', async (req, res) => {
    try {
        const { place_id, key, fields } = req.query;
        
        if (!place_id || !key) {
            return res.status(400).json({ 
                error: 'Missing required parameters: place_id and key' 
            });
        }

        const fieldsParam = fields || 'website,formatted_phone_number,international_phone_number';
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=${fieldsParam}&key=${key}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('Places Details API error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch place details',
            details: error.message 
        });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'outta_web.html'));
});

// Serve index.html as alternative
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'outta_web.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Outta Web server running on port ${PORT}`);
    console.log(`📱 App available at: http://localhost:${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
