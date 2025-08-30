const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const hasDb = !!process.env.DATABASE_URL;
let pool = null;
if (hasDb) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure required DB schema exists (users, sessions)
async function ensureSchema() {
    if (!hasDb || !pool) return;
    try {
        // Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                verified BOOLEAN DEFAULT FALSE,
                reset_code TEXT
            );
        `);
        // Case-insensitive uniqueness helper index
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));
        `);
        // Sessions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                email TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ Database schema ensured (users, sessions)');
    } catch (e) {
        console.error('❌ Error ensuring DB schema:', e);
    }
}

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

// Database helpers (only used when DATABASE_URL is set)
async function dbGetUserByEmail(email) {
    const { rows } = await pool.query('SELECT id, name, email, password, verified, reset_code FROM users WHERE LOWER(email)=LOWER($1)', [email]);
    return rows[0] || null;
}

async function dbCreateUser({ name, email, password }) {
    // Hash password before storing
    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
        'INSERT INTO users(name, email, password, verified) VALUES($1,$2,$3,true) RETURNING id, name, email, verified',
        [name, email, hashed]
    );
    return rows[0];
}

async function dbCreateSession(userId, email) {
    const sessionId = Math.random().toString(36).substring(2, 15);
    await pool.query('INSERT INTO sessions(id, user_id, email) VALUES($1,$2,$3)', [sessionId, userId, email]);
    return sessionId;
}

async function dbGetUserBySession(sessionId) {
    const { rows } = await pool.query(
        `SELECT u.id, u.name, u.email, u.verified
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.id = $1`,
        [sessionId]
    );
    return rows[0] || null;
}

async function dbSetResetCode(userId, code) {
    await pool.query('UPDATE users SET reset_code=$1 WHERE id=$2', [code, userId]);
}

async function dbResetPassword(email, code, newPassword) {
    const { rows } = await pool.query('SELECT id, reset_code FROM users WHERE LOWER(email)=LOWER($1)', [email]);
    const user = rows[0];
    if (!user || user.reset_code !== code) return false;
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1, reset_code=NULL WHERE id=$2', [hashed, user.id]);
    return true;
}

async function dbVerifyEmail(email) {
    const { rowCount } = await pool.query('UPDATE users SET verified=true WHERE LOWER(email)=LOWER($1)', [email]);
    return rowCount > 0;
}

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

// Initialize DB schema on startup (non-blocking)
if (hasDb) {
    ensureSchema().catch(() => {});
}

// Serve PWA manifest with correct content type
app.get('/manifest.webmanifest', (req, res) => {
    res.type('application/manifest+json');
    res.sendFile(path.join(__dirname, 'manifest.webmanifest'));
});

// (Optional) Ensure service worker is served from root
app.get('/sw.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, 'sw.js'));
});

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

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (hasDb) {
            const user = await dbGetUserByEmail(email);
            if (user) {
                let valid = false;
                if (user.password && user.password.startsWith('$2')) {
                    // hashed
                    valid = await bcrypt.compare(password, user.password);
                } else {
                    // legacy plaintext
                    valid = user.password === password;
                }
                if (valid) {
                    const sessionId = await dbCreateSession(user.id, user.email);
                    return res.json({
                        success: true,
                        user: { id: user.id, name: user.name, email: user.email, verified: user.verified },
                        sessionId
                    });
                }
            }
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Fallback: in-memory
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && user.password === password) {
            const sessionId = Math.random().toString(36).substring(2, 15);
            sessions[sessionId] = { userId: user.id, email: user.email, createdAt: new Date().toISOString() };
            return res.json({
                success: true,
                user: { id: user.id, name: user.name, email: user.email, verified: user.verified },
                sessionId
            });
        }
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        if (hasDb) {
            const exists = await dbGetUserByEmail(email);
            if (exists) return res.status(400).json({ success: false, message: 'An account with this email already exists' });
            const user = await dbCreateUser({ name, email, password });
            const sessionId = await dbCreateSession(user.id, user.email);
            return res.json({ success: true, user, sessionId });
        }

        // Fallback: in-memory
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists' });
        }
        const newUser = { id: users.length + 1, name, email, password, verified: true, createdAt: new Date().toISOString() };
        users.push(newUser);
        const sessionId = Math.random().toString(36).substring(2, 15);
        sessions[sessionId] = { userId: newUser.id, email: newUser.email, createdAt: new Date().toISOString() };
        res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, verified: newUser.verified }, sessionId });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/auth/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!code || code.length !== 6) return res.status(400).json({ success: false, message: 'Invalid verification code' });

        if (hasDb) {
            const ok = await dbVerifyEmail(email);
            return ok
                ? res.json({ success: true, message: 'Email verified successfully' })
                : res.status(404).json({ success: false, message: 'User not found' });
        }
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.verified = true;
        res.json({ success: true, message: 'Email verified successfully' });
    } catch (err) {
        console.error('Verify error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/auth/reset-request', async (req, res) => {
    try {
        const { email } = req.body;
        if (hasDb) {
            const user = await dbGetUserByEmail(email);
            if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });
            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
            await dbSetResetCode(user.id, resetCode);
            return res.json({ success: true, message: 'Reset code sent', resetCode }); // display-only for dev
        }
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetCode = resetCode;
        res.json({ success: true, message: 'Reset code sent', resetCode });
    } catch (err) {
        console.error('Reset request error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword, confirmNewPassword } = req.body;
        if (newPassword !== confirmNewPassword) return res.status(400).json({ success: false, message: 'Passwords do not match' });

        if (hasDb) {
            const ok = await dbResetPassword(email, code, newPassword);
            return ok
                ? res.json({ success: true, message: 'Password reset successfully' })
                : res.status(400).json({ success: false, message: 'Invalid reset code' });
        }
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && user.resetCode === code) {
            user.password = newPassword;
            delete user.resetCode;
            return res.json({ success: true, message: 'Password reset successfully' });
        }
        res.status(400).json({ success: false, message: 'Invalid reset code' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/auth/check-session', async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        if (!sessionId) return res.status(401).json({ success: false, message: 'No valid session' });

        if (hasDb) {
            const user = await dbGetUserBySession(sessionId);
            if (!user) return res.status(401).json({ success: false, message: 'No valid session' });
            return res.json({ success: true, user });
        }

        if (sessions[sessionId]) {
            const session = sessions[sessionId];
            const user = users.find(u => u.id === session.userId);
            if (user) return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, verified: user.verified } });
            return res.status(401).json({ success: false, message: 'Invalid session' });
        }
        res.status(401).json({ success: false, message: 'No valid session' });
    } catch (err) {
        console.error('Check-session error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
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

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Outta Web App',
        version: '1.0.0'
    });
});

// DB Health endpoint (simple)
app.get('/api/db/health', async (req, res) => {
    if (!hasDb) return res.json({ hasDb: false, connected: false });
    try {
        await pool.query('select 1');
        res.json({ hasDb: true, connected: true });
    } catch (e) {
        res.status(500).json({ hasDb: true, connected: false, error: e.message });
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
