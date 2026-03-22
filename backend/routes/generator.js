const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

function getNextMidnightPT() {
    const now = new Date();
    // Start from "now" in PT
    const ptStr = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const ptDate = new Date(ptStr);
    
    // Create "tomorrow" in PT
    const tomorrowPT = new Date(ptDate);
    tomorrowPT.setDate(tomorrowPT.getDate() + 1);
    tomorrowPT.setHours(0, 0, 0, 0);
    
    // Convert that PT "tomorrow 00:00" back to a global timestamp
    // We do this by calculating the offset difference
    const diff = tomorrowPT.getTime() - ptDate.getTime();
    return new Date(now.getTime() + diff);
}

// Backend Memory Lock to prevent early hits from resetting Gemini quota
const activeCooldowns = new Map();

const { GoogleGenerativeAI } = require('@google/generative-ai');

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
          const minutes = Math.floor(wait / 60);
          const seconds = wait % 60;
          const formattedWait = `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
          const resAt = expiry;
          return res.status(429).json({ 
              error: `⌛ Wait ${formattedWait} for 100% success.`,
              retryAfter: wait,
              quotaReset: false,
              resetAt: resAt
          });
      }
      activeCooldowns.delete(userId);
  }

  try {
    const { className, subject, topic, subTopic, language } = req.body;
    if (!className || !subject || !topic || !subTopic || !language) {
      return res.status(400).json({ error: 'Fields missing' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert teacher.
IMPORTANT: Respond ONLY in the ${language} language.
Generate structured teaching content for:
Class: ${className}
Subject: ${subject}
Topic: ${topic}
Sub-topic: ${subTopic}

Format your response EXACTLY with these headings:

Information:
Topic: ${topic}
Sub-topic: ${subTopic}
Target Grade Level: Class ${className}
Duration: 45-50 minutes

Lesson Plan:
(Must start directly with Learning Objectives)

Classroom Activities:
[Engagement activities for students]

Homework:
[Practice assignments]

Assessment Questions:
[Questions with Answers]`;

    const result = await model.generateContentStream(prompt);
    
    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      // Wrap chunk in standard SSE format
      res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
    res.end();

    // Success buffer
    activeCooldowns.set(userId, Date.now() + 5000);

  } catch (error) {
    console.error('Streaming Error:', error);
    const resetDateVal = getNextMidnightPT();
    const resetAtTime = resetDateVal.getTime();
    
    let userMessage = error.message || 'Generation Interrupted';
    
    // Clean up Gemini Quota Errors
    if (userMessage.includes('429') || userMessage.includes('quota')) {
        const timeStr = resetDateVal.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
        userMessage = `⚠️ Daily AI Limit Exceeded. Please try again after midnight (${timeStr} IST).`;
    }

    if (!res.headersSent) {
      res.status(500).json({ 
          error: userMessage, 
          quotaReset: userMessage.includes('Limit Exceeded'),
          resetAt: resetAtTime
      });
    } else {
      res.write(`data: ${JSON.stringify({ 
          error: userMessage, 
          quotaReset: userMessage.includes('Limit Exceeded'),
          resetAt: resetAtTime
      })}\n\n`);
      res.end();
    }
  }
});

module.exports = router;
