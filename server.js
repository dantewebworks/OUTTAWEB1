const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
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

// Serve static files
app.use(express.static(path.join(__dirname)));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Outta Web API is running',
        timestamp: new Date().toISOString()
    });
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
