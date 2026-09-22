const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// In-memory storage for contact messages (in production, use a database)
let contactMessages = [];

// Load existing messages from file
function loadMessages() {
    try {
        const dataPath = path.join(__dirname, 'data', 'contactReceived.json');
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf8');
            contactMessages = JSON.parse(data);
        }
    } catch (err) {
        console.error('Error loading messages:', err);
    }
}

// Save messages to file
function saveMessages() {
    try {
        const dataPath = path.join(__dirname, 'data', 'contactReceived.json');
        fs.writeFileSync(dataPath, JSON.stringify(contactMessages, null, 2));
    } catch (err) {
        console.error('Error saving messages:', err);
    }
}

// Initialize
loadMessages();

// API Endpoints

// Get all contact messages
app.get('/api/messages', (req, res) => {
    res.json(contactMessages);
});

// Get a specific message
app.get('/api/messages/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const message = contactMessages[id];
    
    if (message) {
        res.json(message);
    } else {
        res.status(404).json({ error: 'Message not found' });
    }
});

// Create a new contact message
app.post('/api/messages', (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    const newMessage = {
        id: contactMessages.length,
        name,
        email,
        message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    contactMessages.push(newMessage);
    saveMessages();
    
    res.status(201).json(newMessage);
});

// Update a message (mark as read)
app.put('/api/messages/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (id >= 0 && id < contactMessages.length) {
        contactMessages[id].read = req.body.read || true;
        saveMessages();
        res.json(contactMessages[id]);
    } else {
        res.status(404).json({ error: 'Message not found' });
    }
});

// Delete a message
app.delete('/api/messages/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (id >= 0 && id < contactMessages.length) {
        const deletedMessage = contactMessages.splice(id, 1)[0];
        saveMessages();
        res.json(deletedMessage);
    } else {
        res.status(404).json({ error: 'Message not found' });
    }
});

// Clear all messages
app.delete('/api/messages', (req, res) => {
    contactMessages = [];
    saveMessages();
    res.json({ message: 'All messages deleted' });
});

// Get website statistics
app.get('/api/stats', (req, res) => {
    const stats = {
        totalMessages: contactMessages.length,
        unreadMessages: contactMessages.filter(m => !m.read).length,
        totalPages: 6,
        lastUpdated: new Date().toISOString()
    };
    
    res.json(stats);
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // In production, use proper authentication with hashed passwords
    if (username === 'admin' && password === 'admin123') {
        res.json({ 
            success: true, 
            message: 'Login successful',
            token: 'sample-token-' + Date.now()
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid credentials' 
        });
    }
});

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/education.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'education.html'));
});

app.get('/hobbies.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'hobbies.html'));
});

app.get('/media.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'media.html'));
});

app.get('/future.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'future.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve CSS and JS files
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/admin.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.js'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the website at http://localhost:${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});
