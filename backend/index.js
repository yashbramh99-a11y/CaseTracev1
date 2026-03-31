require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
// Ensure GEMINI_API_KEY is placed in backend/.env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Example basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', msg: 'NyayaTrack Backend is running.' });
});

// AI Chatbot Route
app.post('/api/chat', async (req, res) => {
  const { message, complaintId, caseDetails } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required." });

  try {
    let systemInstruction = "You are NyayaTrack AI Consultant, a compassionate legal aid assistant helping Indian citizens track their police complaints. You have deep knowledge of Indian CrPC sections 154, 156, 173.";
    if (caseDetails) {
        const lastUpdate = caseDetails.updates && caseDetails.updates.length > 0 ? caseDetails.updates[0].date + " - " + caseDetails.updates[0].text : "No updates";
        systemInstruction += ` You are aware of the user's case: complaint ID ${complaintId || caseDetails.id || 'Unknown'}, status ${caseDetails.status || 'Unknown'}, assigned officer ${caseDetails.officer || 'Unknown'}, last update ${lastUpdate}. Answer questions about their case, explain their legal rights simply, and if the case is neglected suggest escalating to SP level. Be warm, clear, and non-intimidating. Respond in the same language the user writes in (Hindi or English).`;
    }
    
    const chat = aiModel.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: "SYSTEM INSTRUCTION: " + systemInstruction }],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am NyayaTrack AI. How can I assist you today concerning your FIR?" }],
            }
        ]
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: "Our AI assistant is temporarily unavailable. Please try again in a moment." });
  }
});

app.listen(PORT, () => {
  console.log(`NyayaTrack server started on http://localhost:${PORT}`);
});
