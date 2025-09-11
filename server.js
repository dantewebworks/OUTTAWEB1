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
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            connectSrc: ["'self'", "https://*.supabase.co"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            // Allow inline event handlers (onclick, etc.) used throughout the app
            scriptSrcAttr: ["'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://maps.googleapis.com", "https://cors-anywhere.herokuapp.com", "https://api.allorigins.win", "https://corsproxy.io", "https://thingproxy.freeboard.io", "https://*.supabase.co"]
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

// Public endpoint exposing safe Supabase config for the client
app.get('/api/public/supabase-config', (req, res) => {
    res.json({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null
    });
});

// Client-consumable runtime config (injects env vars into window.__ENV__)
app.get('/config.js', (req, res) => {
    res.type('application/javascript');
    const payload = {
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    };
    res.send(`window.__ENV__ = ${JSON.stringify(payload)};`);
});

// Mirror config at /api/config for Vercel parity
app.get('/api/config', (req, res) => {
    res.type('application/javascript');
    const payload = {
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    };
    res.send(`window.__ENV__ = ${JSON.stringify(payload)};`);
});

// Safe fingerprint to compare envs across deployments (no secrets revealed)
app.get('/api/config-fingerprint', (req, res) => {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const crypto = require('crypto');
        const hash = (v) => (v ? crypto.createHash('sha256').update(v).digest('hex').slice(0, 12) : null);
        let urlHost = null;
        try { urlHost = url ? new URL(url).host : null; } catch {}
        res.json({
            present: { url: !!url, anon: !!anon },
            urlHost,
            urlHash: hash(url),
            anonHash: hash(anon)
        });
    } catch (e) {
        res.status(500).json({ error: 'fingerprint_error', message: e.message });
    }
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

// Foursquare Places API proxy endpoints (local dev parity)
app.get('/api/foursquare/search', async (req, res) => {
    try {
        const { query, near, ll, limit } = req.query;
        const key = process.env.FOURSQUARE_API_KEY || req.headers['x-fsq-key'] || req.query.key;
        if (!key) return res.status(400).json({ error: 'missing_api_key', message: 'Foursquare API key not provided' });
        if (!query) return res.status(400).json({ error: 'missing_param', message: 'query is required' });
        if (!near && !ll) return res.status(400).json({ error: 'missing_param', message: 'near or ll is required' });
        const params = new URLSearchParams();
        params.set('query', query);
        params.set('sort', 'RELEVANCE');
        params.set('limit', String(limit || 50));
        params.set('fields', 'fsq_id,name,location,website,tel,rating,categories');
        if (near) params.set('near', near);
        if (ll) params.set('ll', ll);
        const fsqUrl = `https://api.foursquare.com/v3/places/search?${params.toString()}`;
        const resp = await fetch(fsqUrl, {
            headers: { 'Accept': 'application/json', 'Authorization': key }
        });
        if (!resp.ok) {
            const text = await resp.text();
            return res.status(resp.status).json({ error: 'fsq_error', status: resp.status, body: text });
        }
        const data = await resp.json();
        res.json({ results: Array.isArray(data.results) ? data.results : data });
    } catch (e) {
        console.error('FSQ search error:', e);
        res.status(500).json({ error: 'internal_error', message: e.message });
    }
});
app.get('/api/foursquare/details', async (req, res) => {
    try {
        const { id, fields } = req.query;
        const key = process.env.FOURSQUARE_API_KEY || req.headers['x-fsq-key'] || req.query.key;
        if (!key) return res.status(400).json({ error: 'missing_api_key', message: 'Foursquare API key not provided' });
        if (!id) return res.status(400).json({ error: 'missing_param', message: 'id is required' });
        const fsqUrl = `https://api.foursquare.com/v3/places/${encodeURIComponent(id)}?fields=${encodeURIComponent(fields || 'website,tel,location,rating')}`;
        const resp = await fetch(fsqUrl, {
            headers: { 'Accept': 'application/json', 'Authorization': key }
        });
        if (!resp.ok) {
            const text = await resp.text();
            return res.status(resp.status).json({ error: 'fsq_error', status: resp.status, body: text });
        }
        const data = await resp.json();
        res.json(data);
    } catch (e) {
        console.error('FSQ details error:', e);
        res.status(500).json({ error: 'internal_error', message: e.message });
    }
});

// Instagram search API proxy endpoint (local dev parity)
app.all('/api/instagram/search', async (req, res) => {
    try {
        // Enable CORS for all origins
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        const { 
            businessName, 
            address, 
            city, 
            state, 
            phone,
            confidenceThreshold = 80 
        } = req.method === 'GET' ? req.query : req.body;

        const apiKey = process.env.GOOGLE_SEARCH_API_KEY || req.headers['x-api-key'];
        const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || req.headers['x-search-engine-id'];

        if (!apiKey || !searchEngineId) {
            return res.status(400).json({ 
                error: 'missing_api_credentials', 
                message: 'Google Custom Search API key and Search Engine ID are required' 
            });
        }

        if (!businessName || !city || !state) {
            return res.status(400).json({ 
                error: 'missing_params', 
                message: 'businessName, city, and state are required' 
            });
        }

        console.log('=== Instagram Search Debug Info ===');
        console.log('Business Name:', businessName);
        console.log('City:', city);
        console.log('State:', state);
        
        // Format query exactly as requested: "<Business Name> <City> <State> site:instagram.com"
        let searchQuery = businessName.trim();
        
        if (city && city.trim()) {
            searchQuery += ` ${city.trim()}`;
        }
        
        if (state && state.trim()) {
            searchQuery += ` ${state.trim()}`;
        }
        
        searchQuery += ' site:instagram.com';
        
        console.log('Final search query:', searchQuery);

        console.log('Instagram search query:', searchQuery);

        // Google Custom Search API request
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=5`;

        const response = await fetch(searchUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Search API error:', errorText);
            return res.status(response.status).json({ 
                error: 'search_api_error', 
                message: 'Google Custom Search API request failed',
                status: response.status,
                details: errorText
            });
        }

        const searchData = await response.json();

        if (!searchData.items || searchData.items.length === 0) {
            return res.json({
                instagramHandle: 'No Instagram Found',
                instagramUrl: null,
                confidenceScore: 0,
                reason: 'No Instagram profiles found in search results'
            });
        }

        // Process search results and identify official business accounts
        let bestMatch = null;
        let highestScore = 0;

        for (const item of searchData.items) {
            const instagramUrl = item.link;
            
            // Extract Instagram handle from URL
            const handleMatch = instagramUrl.match(/instagram\.com\/([^\/\?]+)/);
            if (!handleMatch) continue;
            
            const handle = handleMatch[1];
            
            // Skip Instagram story, post, reel, or IGTV URLs - we want profile URLs only
            if (handle.includes('stories') || handle.includes('p/') || handle.includes('reel/') || handle.includes('tv/')) continue;
            
            // Skip common non-business handles
            if (handle.includes('explore') || handle.includes('accounts') || handle.includes('hashtag')) continue;
            
            // Skip extremely short handles (likely truncated or invalid) - minimum 2 characters
            if (handle.length < 2) continue;
            
            // Skip single letter handles (like @p) which are definitely not business accounts
            if (handle.length === 1) continue;
            
            // Skip handles that are just numbers or very generic patterns
            if (/^\d+$/.test(handle) || /^[a-z]$/.test(handle)) continue;

            const title = (item.title || '').toLowerCase();
            const snippet = (item.snippet || '').toLowerCase();
            const fullText = (title + ' ' + snippet).toLowerCase();

            const lowerBusinessName = cleanBusinessName.toLowerCase();
            const businessWords = lowerBusinessName.split(' ').filter(word => word.length > 2);

            let score = 0;
            let reasons = [];

            // Primary: Exact business name match in title or handle
            const handleLower = handle.toLowerCase().replace(/[^a-z0-9]/g, '');
            const businessNameClean = lowerBusinessName.replace(/[^a-z0-9]/g, '');
            
            if (title.includes(lowerBusinessName) || handleLower.includes(businessNameClean)) {
                score += 50;
                reasons.push('Exact business name match');
            }

            // Secondary: Partial business name match (all words must be present)
            const titleWordsMatchCount = businessWords.filter(word => fullText.includes(word)).length;
            if (titleWordsMatchCount === businessWords.length && businessWords.length > 0) {
                score += 30;
                reasons.push('All business name words found');
            } else if (titleWordsMatchCount > 0) {
                score += (titleWordsMatchCount / businessWords.length) * 20;
                reasons.push(`${titleWordsMatchCount}/${businessWords.length} business words found`);
            }

            // Location relevance (if provided)
            if (city && (fullText.includes(city.toLowerCase()) || fullText.includes(state.toLowerCase()))) {
                score += 15;
                reasons.push('Location mentioned');
            }

            // Phone number match (strong indicator)
            if (phone && snippet.includes(phone.replace(/\D/g, ''))) {
                score += 25;
                reasons.push('Phone number match');
            }

            // Business indicators
            const businessIndicators = ['official', 'verified', 'business', 'company', 'corp', 'llc', 'inc'];
            if (businessIndicators.some(indicator => fullText.includes(indicator))) {
                score += 10;
                reasons.push('Business account indicators');
            }

            // Penalties for non-official accounts
            const nonOfficialIndicators = ['fan', 'news', 'update', 'blog', 'gossip', 'celebrity', 'review', 'meme'];
            if (nonOfficialIndicators.some(indicator => fullText.includes(indicator))) {
                score -= 20;
                reasons.push('Non-official account indicators detected');
            }

            // Penalty for overly generic handles
            const underscoreCount = (handle.match(/_/g) || []).length;
            const numberCount = (handle.match(/\d/g) || []).length;
            if (underscoreCount > 2 || numberCount > 3) {
                score -= 15;
                reasons.push('Generic handle pattern penalty');
            }

            console.log(`Instagram handle: @${handle}, Score: ${score}, URL: ${instagramUrl}`);

            if (score > highestScore) {
                highestScore = score;
                bestMatch = {
                    instagramHandle: `@${handle}`,
                    instagramUrl: instagramUrl,
                    confidenceScore: Math.round(score),
                    reasons: reasons,
                    title: item.title,
                    snippet: item.snippet
                };
            }
        }

        // Return only one Instagram account per business as requested
        const minThreshold = Math.max(confidenceThreshold, 40);
        
        if (bestMatch && bestMatch.confidenceScore >= minThreshold) {
            return res.json({
                instagramHandle: bestMatch.instagramHandle,
                instagramUrl: bestMatch.instagramUrl,
                confidenceScore: bestMatch.confidenceScore,
                status: 'found'
            });
        } else {
            return res.json({
                instagramHandle: 'No Instagram found',
                instagramUrl: null,
                confidenceScore: bestMatch ? bestMatch.confidenceScore : 0,
                status: 'not_found',
                reason: bestMatch ? `Confidence score ${bestMatch.confidenceScore} below threshold ${minThreshold}` : 'No official business Instagram account found'
            });
        }

    } catch (error) {
        console.error('Instagram search error:', error);
        res.status(500).json({ 
            error: 'internal_error', 
            message: error.message 
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

// Serve manifest and service worker
app.get('/manifest.webmanifest', (req, res) => {
    res.sendFile(path.join(__dirname, 'manifest.webmanifest'));
});

app.get('/sw.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'sw.js'));
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
