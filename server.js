const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000; // Use Render's port, fallback to 3000

app.use(cors());

// --- Mock Database Data ---

const mockContent = {
    'homepage-hero': {
        title: 'This is the AI-generated hero title...',
        body: '...and this is the body content.'
    },
    'about-us-snippet': {
        title: 'About Our Company',
        body: 'We are a class-leading firm.'
    }
};

const mockSocialPosts = [
    {
        id: 'post-xyz-123',
        created_at: 1700000001,
        content: 'This is our first social post, automatically becoming a blog post!',
        image_url: 'https://placehold.co/600x400/EEE/333?text=Post+Image+1'
    },
    {
        id: 'post-abc-789',
        created_at: 1700000002,
        content: 'This is a second social post. The Telekenisis app is amazing!',
        image_url: 'https://placehold.co/600x400/DDD/222?text=Post+Image+2'
    }
];

const mockSeoSnippets = {
    'head_snippet': '<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag(\'js\', new Date());\n  gtag(\'config\', \'G-XXXXXXXXXX\');\n</script>',
    'footer_snippet': '<!-- Facebook Pixel Code -->\n<script>\n  // FB Pixel JS\n</script>\n<!-- End Facebook Pixel Code -->'
};

const VALID_API_KEY = 'test-key'; // This is the key the plugin must send

// --- API Authentication Middleware ---
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Error: No API key provided.' });
    }

    if (token !== VALID_API_KEY) {
        return res.status(403).json({ message: 'Error: Invalid API key.' });
    }

    next(); // Key is valid, proceed to the route
};

// --- API Endpoints ---

// Endpoint 1: Get a specific content snippet
app.get('/v1/content/:slug', authenticate, (req, res) => {
    const slug = req.params.slug;
    if (mockContent[slug]) {
        res.json({
            status: 'success',
            data: mockContent[slug]
        });
    } else {
        res.status(404).json({ status: 'error', message: 'Content not found' });
    }
});

// Endpoint 2: Get social posts (for blog automation)
app.get('/v1/social_posts', authenticate, (req, res) => {
    const sinceTimestamp = parseInt(req.query.since, 10) || 0;
    
    const newPosts = mockSocialPosts.filter(post => post.created_at > sinceTimestamp);
    
    res.json({
        status: 'success',
        data: newPosts
    });
});

// Endpoint 3: Get global SEO snippets
app.get('/v1/seo_snippets', authenticate, (req, res) => {
    res.json({
        status: 'success',
        data: mockSeoSnippets
    });
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('---');
    console.log('Mock API Key: test-key');
    console.log('---');
    console.log('Available Endpoints:');
    console.log('/v1/content/homepage-hero');
    console.log('/v1/social_posts?since=0');
    console.log('/v1/seo_snippets');
});
