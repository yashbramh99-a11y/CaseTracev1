export default async function handler(req, res) {
  // Allow only POST methods
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  // Read the environment variable from Vercel's secure environment or local .env
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY environment variable. Make sure it's set in Vercel.");
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    // Forward the payload verbatim from the frontend to Gemini API
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        return res.status(response.status).json(data);
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Vercel API Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to communicate with AI service inside Vercel.' });
  }
}
