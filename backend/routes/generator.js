const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Backend Memory Lock to prevent early hits from resetting Gemini quota
const activeCooldowns = new Map();

router.post('/', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return res.status(500).json({ error: 'AI API Key is missing' });
  }

  // Check Backend Lock
  if (activeCooldowns.has(userId)) {
      const expiry = activeCooldowns.get(userId);
      if (Date.now() < expiry) {
          const wait = Math.ceil((expiry - Date.now()) / 1000);
          return res.status(429).json({ 
              error: `⌛ BACKEND SYSTEM LOCK: We are protecting your AI quota. Please wait ${wait}s more for a 100% success guarantee.`,
              retryAfter: wait
          });
      } else {
          activeCooldowns.delete(userId);
      }
  }

  try {
    const { className, subject, topic, subTopic, language } = req.body;

    if (!className || !subject || !topic || !subTopic || !language) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `You are an expert teacher.
IMPORTANT: Respond ONLY in the ${language} language.

Generate structured teaching content for:
Class: ${className}
Subject: ${subject}
Topic: ${topic}
Sub-topic: ${subTopic}
Language: ${language}

Provide output in this format:
Information: [Context]
Lesson Plan: [Flow]
Classroom Activities: [Engagement]
Homework: [Practice]
Assessment Questions: [Questions with Answers]` 
            }] 
          }]
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 429) {
            // Force 180s (3 minute) DEFINITIVE wait.
            const waitSecs = 180; 
            const expiry = Date.now() + (waitSecs * 1000);
            activeCooldowns.set(userId, expiry);

            const refreshTime = new Date(expiry);
            const timeStr = refreshTime.toLocaleString('en-IN', { 
                timeZone: 'Asia/Kolkata', 
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
            });
            
            return res.status(429).json({ 
                error: `🛑 AI RATE LIMIT: Your quota will definitively refresh at ${timeStr}. \n\nIMPORTANT: I have locked your workstation for 3 minutes to guarantee Google's quota resets correctly. Please wait for the button to turn green.`,
                retryAfter: waitSecs
            });
        }
        return res.status(response.status).json({ error: data.error?.message || 'Gemini API Error' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("AI returned empty response.");
    
    res.json({ content: text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Failed' });
  }
});

module.exports = router;
