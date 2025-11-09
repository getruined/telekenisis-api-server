const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Serve Static Files ---
// This serves your index.html
app.use(express.static(path.join(__dirname, 'public')));

// --- DYNAMIC Mock Database ---
let mockContentDB = {
    "about-us-blurb": {
        "content_html": "We are a cool company that does cool things."
    },
    "homepage-hero": {
        "content_html": "This is the AI-generated hero title... and this is the body content."
    }
};
const mockSocialPosts = [
    { "id": "post-xyz-123", "created_at": 1700000001, "title": "First Blog Post", "content_html": "<p>This is our first social post!</p>" }
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

// "WRITE" endpoint for your Bitrig App
app.post('/v1/content', authenticate, (req, res) => {
    const { contentSlug, contentHtml } = req.body;
    if (!contentSlug || !contentHtml) {
        return res.status(400).json({ success: false, message: 'Error: Missing contentSlug or contentHtml' });
    }
    mockContentDB[contentSlug] = { "content_html": contentHtml };
    console.log('DATABASE UPDATED. New content for "' + contentSlug + '" saved.');
    res.status(201).json({ success: true, data: mockContentDB[contentSlug] });
});

// "READ" endpoint for your WordPress Plugin
app.get('/v1/content/:slug', authenticate, (req, res) => {
    const slug = req.params.slug;
    if (mockContentDB[slug]) {
        res.json({ success: true, data: mockContentDB[slug] });
    } else {
        res.status(404).json({ success: false, message: 'Content not found' });
    }
});

// "READ" endpoint for Social Posts
app.get('/v1/social_posts', authenticate, (req, res) => {
    const sinceTimestamp = parseInt(req.query.since, 10) || 0;
    const newPosts = mockSocialPosts.filter(post => post.created_at > sinceTimestamp);
    res.json({ success: true, data: newPosts });
});

// "READ" endpoint for SEO Snippets
app.get('/v1/seo_snippets', authenticate, (req, res) => {
    res.json({ success: true, data: mockSeoSnippets });
});

// --- NEW, EXPLICIT DOWNLOAD ROUTE ---
// This code has been changed. It no longer uses the old "/download/plugin"
// It now *explicitly* serves the file from the public folder.
app.get('/telekenisis-content-sync.zip', (req, res) => {
    const file = path.join(__dirname, 'public', 'telekenisis-content-sync.zip');
    
    // Use res.download() to force the browser to download it.
    res.download(file, 'telekenisis-content-sync.zip', (err) => {
        if (err) {
            // This log will show up in Render if the file is *still* not found
            console.error("CRITICAL: /public/telekenisis-content-sync.zip not found.", err.message);
            res.status(404).json({ success: false, message: "File not found. The server could not find the zip file." });
        }
    });
});

// --- NEW: Handle Website Root ---
// This is your homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`API and Website server (v9) running on port ${port}`);
    console.log('---');
    console.log('Website is served from the "public" folder.');
    console.log('API is available under the "/v1/" prefix.');
});
