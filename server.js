const express = require('express');
const cors = require('cors');
const path = require('path'); // We need 'path' to serve static files
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- NEW: Serve Static Files ---
// This line tells Express to serve any files in the 'public' folder
// as the website's root.
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

// ... (other mock data) ...
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

// --- API Endpoints (These will still work) ---
// All API routes now *must* have a prefix like /v1/ to avoid
// conflicting with the static website files.

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

// "DOWNLOAD" endpoint for the Plugin
app.get('/download/plugin', (req, res) => {
    // We assume the zip file is in the root, *not* in the public folder.
    // You will need to upload 'telekenisis-content-sync.zip' to GitHub.
    const file = path.join(__dirname, 'telekenisis-content-sync.zip');
    res.download(file, (err) => {
        if (err) {
            console.error("Plugin download error:", err.message);
            res.status(404).json({ success: false, message: "Plugin file not found. (Did you upload it to GitHub?)" });
        }
    });
});

// --- NEW: Handle Website Root ---
// This makes sure that if someone just goes to the root URL,
// they get the index.html file.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`API and Website server running on port ${port}`);
    console.log('---');
    console.log('Website is served from the "public" folder.');
    console.log('API is available under the "/v1/" prefix.');
});
