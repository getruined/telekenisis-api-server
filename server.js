const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000; // Use Render's port, fallback to 3000

app.use(cors());
app.use(express.json()); // <-- CRITICAL: This allows server to read incoming JSON

// --- DYNAMIC Mock Database ---
// This object will start empty and be FILLED by your Bitrig App.
// When the server restarts, this data will be lost.
// The (final-final) step is to replace this with a real database like Firebase.
let mockContentDB = {
    "about-us-blurb": {
        "content_html": "This is the default 'about us' blurb. You can change it from your app."
    }
};

// (The other mock data can stay the same)
const mockSocialPosts = [
    {
        "id": "post-xyz-123", "created_at": 1700000001, "title": "First Blog Post",
        "content_html": "<p>This is our first social post!</p>"
    }
];
const mockSeoSnippets = {
    "head_snippet": "<!-- Google Analytics -->",
    "footer_snippet": "<!-- Facebook Pixel -->"
};
const VALID_API_KEY = 'test-key';

// --- API Authentication Middleware ---
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Error: No API key provided.' });
    if (token !== VALID_API_KEY) return res.status(403).json({ success: false, message: 'Error: Invalid API key.' });
    next();
};

// --- API Endpoints ---

// MISSION 2: This is the NEW "WRITE" endpoint for your Bitrig App
app.post('/v1/content', authenticate, (req, res) => {
    const { contentSlug, contentHtml } = req.body;

    if (!contentSlug || !contentHtml) {
        return res.status(400).json({ success: false, message: 'Error: Missing contentSlug or contentHtml' });
    }

    // Add or update the content in our dynamic database
    mockContentDB[contentSlug] = {
        "content_html": contentHtml
    };

    console.log('DATABASE UPDATED. New content for "' + contentSlug + '" saved.');
    
    // Send back a "201 Created" success message
    res.status(201).json({ 
        success: true, 
        data: mockContentDB[contentSlug] 
    });
});

// This is the "READ" endpoint for your WordPress Plugin
app.get('/v1/content/:slug', authenticate, (req, res) => {
    const slug = req.params.slug;
    
    if (mockContentDB[slug]) {
        // Content was found, send it
        res.json({
            success: true,
            data: mockContentDB[slug] // This will be { "content_html": "..." }
        });
    } else {
        // Content was NOT found, send a 404 error
        res.status(404).json({ success: false, message: 'Content not found' });
    }
});

// Endpoint 2: Get social posts (for blog automation)
app.get('/v1/social_posts', authenticate, (req, res) => {
    const sinceTimestamp = parseInt(req.query.since, 10) || 0;
    const newPosts = mockSocialPosts.filter(post => post.created_at > sinceTimestamp);
    res.json({ success: true, data: newPosts });
});

// Endpoint 3: Get global SEO snippets
app.get('/v1/seo_snippets', authenticate, (req, res) => {
    res.json({ success: true, data: mockSeoSnippets });
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`API server running on port ${port}`);
    console.log(`Ready to receive data at /v1/content (POST)`);
    console.log(`Ready to send data from /v1/content/:slug (GET)`);
    console.log('---');
    console.log('Mock API Key: test-key');
});
