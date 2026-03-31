const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Proxy Endpoint for Gemini API
app.post('/api/chat', async (req, res) => {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
  try {
    // Forward the exact request body from the frontend to Gemini
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    // Return the response back to the frontend
    if (!response.ok) {
        return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI service' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`NyayaTrack proxy server running on port ${PORT}`);
});
