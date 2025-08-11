const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test login route
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    if (email === 'admin@docgen.com' && password === 'admin123') {
      res.json({
        message: 'Login successful',
        token: 'test-token-123',
        user: {
          id: '1',
          name: 'Test Admin',
          email: 'admin@docgen.com',
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Test templates route
app.get('/api/templates', (req, res) => {
  res.json({
    templates: [
      {
        _id: '1',
        name: 'Test Template',
        type: 'offer_letter',
        content: 'Hello {{name}}, welcome to {{company}}!',
        placeholders: [
          { name: 'name', type: 'text', required: true },
          { name: 'company', type: 'text', required: true }
        ]
      }
    ]
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
