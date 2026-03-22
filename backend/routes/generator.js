const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

function getNextMidnightPT() {
    const now = new Date();
    let d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), 0, 0, 0));
    let safety = 0;
    while (safety < 48) {
        d.setUTCHours(d.getUTCHours() + 1);
        const ptHour = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hourCycle: 'h23' }).format(d);
        const match = ptHour.match(/\d+/);
        if (match && parseInt(match[0], 10) === 0) {
            return d;
        }
        safety++;
    }
    return new Date(Date.now() + 86400 * 1000);
}

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
            const errorMsg = data.error?.message || 'Rate limit exceeded';
            const lowerMsg = errorMsg.toLowerCase();
            
            let isDaily = false;
            if (lowerMsg.includes('per minute')) {
                isDaily = false;
            } else if (lowerMsg.includes('day') || lowerMsg.includes('daily') || lowerMsg.includes('exhausted') || lowerMsg.includes('billing') || lowerMsg.includes('quota')) {
                isDaily = true;
            }
            
            let nextRefreshDate;
            let waitSecs = 60; // default
            
            // Check Google's explicit retryDelay if provided
            if (Array.isArray(data.error?.details)) {
                for (const detail of data.error.details) {
                    if (detail.retryDelay) {
                        const num = parseFloat(detail.retryDelay.replace('s', ''));
                        if (!isNaN(num)) waitSecs = Math.ceil(num) + 2; // +2s safety buffer
                        break;
                    }
                }
            }
            
            if (isDaily) {
                nextRefreshDate = getNextMidnightPT();
                waitSecs = Math.ceil((nextRefreshDate.getTime() - Date.now()) / 1000);
                if (waitSecs <= 0) waitSecs = 86400; // Failsafe
            } else {
                nextRefreshDate = new Date(Date.now() + waitSecs * 1000);
            }

            activeCooldowns.set(userId, nextRefreshDate.getTime());

            const timeStr = nextRefreshDate.toLocaleString('en-IN', { 
                timeZone: 'Asia/Kolkata', 
                weekday: 'long', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
            });
            
            const detailedError = isDaily 
                ? `🛑 DAILY RATE LIMIT OR BILLING QUOTA REACHED.\n\nYour limit exactly resets at:\n📅 ${timeStr}\n\nPlease wait until then! (Computed via Google).`
                : `🛑 AI RATE LIMIT: Exactly ${waitSecs} seconds cooldown applied by Google. Your quota will refresh at ${timeStr}.`;

            return res.status(429).json({ 
                error: detailedError,
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
