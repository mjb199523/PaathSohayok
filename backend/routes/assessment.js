const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Multer config: store in memory, max 20MB (PDFs can be larger)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and image files (PNG, JPG, WebP) are allowed'));
        }
    }
});

// Cooldown map
const assessmentCooldowns = new Map();

router.post('/generate', verifyToken, upload.single('file'), async (req, res) => {
    const userId = req.user.id;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
        return res.status(500).json({ error: 'AI API Key is missing' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a file (PDF or Image)' });
    }

    const questionCount = Math.min(Math.max(parseInt(req.body.questionCount) || 5, 1), 10);
    const language = req.body.language || 'English';

    // Check Content Limit
    const { data: profile, error: limitError } = await supabaseAdmin
        .from('profiles')
        .select('content_limit, content_count, role')
        .eq('id', userId)
        .single();

    if (limitError || !profile) {
        return res.status(500).json({ error: 'Failed to verify user limits' });
    }

    if (profile.role !== 'admin') {
        if (profile.content_count >= profile.content_limit) {
            return res.status(403).json({
                error: 'Contact the admin to increase your limit',
                limitReached: true
            });
        }
    }

    // Increment content count
    if (profile.role !== 'admin') {
        await supabaseAdmin
            .from('profiles')
            .update({ content_count: profile.content_count + 1 })
            .eq('id', userId);
    }

    // Backend cooldown check
    if (assessmentCooldowns.has(userId)) {
        const expiry = assessmentCooldowns.get(userId);
        if (Date.now() < expiry) {
            const wait = Math.ceil((expiry - Date.now()) / 1000);
            return res.status(429).json({
                error: `⌛ Please wait ${wait}s before generating again.`,
                resetAt: expiry
            });
        }
        assessmentCooldowns.delete(userId);
    }

    try {
        // Set up SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const file = req.file;
        const base64Data = file.buffer.toString('base64');

        // Determine the content descriptor for the prompt
        const isImage = file.mimetype.startsWith('image/');
        const contentDescriptor = isImage ? 'this image' : 'this document';

        // Build multimodal parts — send the file (PDF or image) directly to Gemini
        // Gemini natively supports PDFs as multimodal input, which handles:
        //   - Scanned/image-heavy PDFs
        //   - Non-Latin scripts (Assamese, Hindi, etc.)
        //   - Mixed text + image content
        //   - Any PDF that pdf-parse would fail to extract text from
        const parts = [
            {
                inlineData: {
                    mimeType: file.mimetype,
                    data: base64Data
                }
            },
            {
                text: `You are an expert teacher and assessment designer.

TASK: Generate EXACTLY ${questionCount} assessment questions based STRICTLY AND ONLY on the content visible in ${contentDescriptor}. Do NOT add any questions from outside this content.

IMPORTANT RULES:
- Respond ONLY in ${language}.
- Generate exactly ${questionCount} questions — no more, no less.
- Each question MUST be directly derived from the provided content.
- Mix question types: MCQ (with 4 options and correct answer marked), Short Answer, and True/False.
- For MCQs, clearly mark the correct answer.
- Number each question clearly.
- After all questions, provide an "Answer Key" section with all correct answers listed.

BEGIN YOUR RESPONSE WITH "Assessment Questions:" directly. No introductions.`
            }
        ];

        // Attempt generation with 1 automatic retry for transient stream errors
        let lastError = null;
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const result = await model.generateContentStream(parts);

                let fullText = '';
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    fullText += chunkText;
                    res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
                }

                res.write(`data: [DONE]\n\n`);
                res.end();

                // Set cooldown
                assessmentCooldowns.set(userId, Date.now() + 5000);
                return; // Success — exit early
            } catch (streamErr) {
                lastError = streamErr;
                console.error(`Assessment stream attempt ${attempt + 1} failed:`, streamErr.message);
                // Only retry on transient "Failed to parse stream" or 503 errors
                const msg = streamErr.message || '';
                if (attempt === 0 && (msg.includes('Failed to parse stream') || msg.includes('503'))) {
                    await new Promise(r => setTimeout(r, 2000)); // wait 2s before retry
                    continue;
                }
                break; // Non-retryable error
            }
        }
        // If we reach here, all attempts failed
        throw lastError;

    } catch (error) {
        console.error('Assessment Generation Error:', error);

        let userMessage = error.message || 'Assessment generation failed';
        if (userMessage.includes('429') || userMessage.includes('quota')) {
            userMessage = '⚠️ Daily AI Limit Exceeded. Please try again later.';
        } else if (userMessage.includes('Failed to parse stream')) {
            userMessage = '⚠️ The AI had trouble processing this document. Please try again.';
        } else if (userMessage.includes('503') || userMessage.includes('overloaded') || userMessage.includes('high demand')) {
            userMessage = '⚠️ The AI model is temporarily busy. Please wait a moment and try again.';
        }

        if (!res.headersSent) {
            res.status(500).json({ error: userMessage });
        } else {
            res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
            res.end();
        }
    }
});

module.exports = router;

