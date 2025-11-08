const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000; // Use Render's port, fallback to 3000

app.use(cors());

// --- Mock Database Data ---
// (FINAL v7 - This version has the correct content_html format
// and includes both slugs)
const mockContentDB = {
    "homepage-hero": {
        "content_html": "This is the AI-generated hero title... and this is the body content."
    },
    "about-us-blurb": {
        "content_html": "We are a cool company that does cool things."
    }
};

const mockSocialPosts = [
    {
        "id": "post-xyz-123",
        "created_at": 1700000001,
        "title": "First Blog Post", // Title for the WP Post
        "content_html": "<p>This is our first social post, automatically becoming a blog post!</p><img src='https://placehold.co/600x400/EEE/333?text=Post+Image+1' alt='Post Image 1'>"
    },
    {
        "id": "post-abc-789",
        "created_at": 1700000002,
        "title": "Second Blog Post", // Title for the WP Post
        "content_html": "<p>This is a second social post. The Telekenisis app is amazing!</p><img src='https://placehold.co/600x400/DDD/222?text=Post+Image+2' alt='Post Image 2'>"
    }
];

const mockSeoSnippets = {
    "head_snippet": "<script async src='https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'></script><script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-XXXXXXXXXX');</script>",
    "footer_snippet": "<!-- Facebook Pixel Code -->"
};

const VALID_API_KEY = 'test-key'; // This is the key the plugin must send

// --- API Authentication Middleware ---
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer <token>"

    if (!token) {
        return res.status(401).json({ success: false, message: 'Error: No API key provided.' });
    }

    if (token !== VALID_API_KEY) {
        return res.status(403).json({ success: false, message: 'Error: Invalid API key.' });
    }

    next(); // Key is valid, proceed to the route
};

// --- API Endpoints ---

// Endpoint 1: Get a specific content snippet
app.get('/v1/content/:slug', authenticate, (req, res) => {
    const slug = req.params.slug;
    
    if (mockContentDB[slug]) {
        // Content was found, send it
        res.json({
            success: true,
            data: mockContentDB[slug] // This will be { "content_html": "..." }
        });
    } else {
        // Content was NOT found, send a 404 error (FIXED from 4404)
        res.status(404).json({ success: false, message: 'Content not found' });
    }
});

// Endpoint 2: Get social posts (for blog automation)
app.get('/v1/social_posts', authenticate, (req, res) => {
    const sinceTimestamp = parseInt(req.query.since, 10) || 0;
    const newPosts = mockSocialPosts.filter(post => post.created_at > sinceTimestamp);
    
    res.json({
        success: true,
        data: newPosts
    });
});

// Endpoint 3: Get global SEO snippets
app.get('/v1/seo_snippets', authenticate, (req, res) => {
    res.json({
        success: true,
        data: mockSeoSnippets
    });
});

// Endpoint 4: Download the plugin
// (This serves the zip file you would upload here)
app.get('/download/plugin', (req, res) => {
    const file = path.join(__dirname, 'telekenisis-content-sync.zip');
    res.download(file, (err) => {
        if (err) {
            res.status(404).json({ success: false, message: "Plugin file not found." });
        }
    });
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`API server running on port ${port}`);
    console.log('---');
    console.log('Mock API Key: test-key');
    console.log('---');
    console.log('Available Endpoints:');
    console.log(`http://localhost:${port}/v1/content/homepage-hero`);
    console.log(`http://localhost:${port}/v1/content/about-us-blurb`);
    console.log(`http://localhost:${port}/v1/social_posts?since=0`);
    console.log(`http://localhost:${port}/v1/seo_snippets`);
    console.log(`http://localhost:${port}/download/plugin`);
});
