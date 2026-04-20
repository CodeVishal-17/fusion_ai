require('dotenv').config();
const { performance } = require('perf_hooks');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const mongoose = require('mongoose');

const { callOpenAI, generateImageDALLE } = require('./services/openai');
const { callDeepseek } = require('./services/deepseek');
const { callMeta } = require('./services/meta');
const { callGemini } = require('./services/gemini');
const { analyzeResponses, improvePrompt } = require('./services/analyzer');
const { generateImagePollinations } = require('./services/pollinations');

const { evaluateResponses } = require('./services/evaluatorService');
const { generateSummary } = require('./services/summaryService');
const { detectAgreement } = require('./services/agreementService');
const { getSmartRouting } = require('./services/smartRoutingService');
const { generateTitle } = require('./services/memoryService');
const { updateStreak } = require('./services/streakService');
const { resolveDisagreement } = require('./services/debateService');

const authMiddleware = require('./middleware/authMiddleware');
const billingMiddleware = require('./middleware/billingMiddleware');
const User = require('./models/User');
const Usage = require('./models/Usage');
const Chat = require('./models/Chat');

const app = express();
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://fusion-ai-ten.vercel.app',
    process.env.FRONTEND_URL
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' })); 

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aifusion', {
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 60000
})
    .then(() => console.log('Connected to MongoDB Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const upload = multer({ storage: multer.memoryStorage() });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/payment', require('./routes/payment'));

// v1 Support
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/user', require('./routes/user'));
app.use('/api/v1/payment', require('./routes/payment'));
app.use('/api/v1/support', require('./routes/support'));
app.use('/api/support', require('./routes/support'));

app.get('/api/test', (req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 }));
app.get('/api/v1/test', (req, res) => res.json({ status: 'ok', v1: true }));

const MODEL_COSTS = {
    openai: 5,
    deepseek: 3,
    meta: 3,
    gemini: 4
};

// Internal API Pricing (USD per 1k tokens)
const MODEL_PRICING = {
    openai: 0.002,
    deepseek: 0.0005,
    meta: 0.0005,
    gemini: 0.001
};

app.post('/api/chat', authMiddleware, billingMiddleware, upload.any(), async (req, res) => {
    try {
        let { chatHistory, bypassModels, smartMode } = req.body;
        
        // Multer puts fields in req.body, but sometimes JSON parsing is needed if sent as string
        let historyObj;    
        try {
            const rawHistory = chatHistory || req.body.chatHistory;
            historyObj = typeof rawHistory === 'string' ? JSON.parse(rawHistory) : rawHistory || {};
        } catch (err) {
            console.error("History Parse Error:", err);
            historyObj = {};
        }
        
        let bypass = [];
        if (bypassModels || req.body.bypassModels) {
            try { 
                const rawBypass = bypassModels || req.body.bypassModels;
                bypass = typeof rawBypass === 'string' ? JSON.parse(rawBypass) : rawBypass || [];
            } catch {}
        }

        const isImageMode = req.body.imageMode === true || req.body.imageMode === 'true';
        const isSearchMode = req.body.searchMode === true || req.body.searchMode === 'true';

        // --- ⚡ SMART ROUTING ---
        let smartConfig = null;
        if (smartMode && !isImageMode) {
            smartConfig = getSmartRouting(smartMode);
            // If smart mode is active, it might override bypass models
            // but we'll respect user selection if they manually deselected something
            // For now, let's just use it as a recommendation or force if specified
        }

        const activeModels = ['openai', 'deepseek', 'meta', 'gemini'].filter(m => !bypass.includes(m));
        let totalCost = activeModels.reduce((sum, model) => sum + (MODEL_COSTS[model] || 0), 0);
        
        const availableCredits = (req.user.credits || 0) + (req.user.dailyFreeCredits || 0);
        if (availableCredits < totalCost) {
            return res.status(402).json({ 
                error: 'INSUFFICIENT_CREDITS',
                message: `This request costs ${totalCost} tokens. You have ${availableCredits} available.`
            });
        }

        let fileTextContext = "";
        let imageBase64 = null; // Still supporting single image for vision models for now

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const mimetype = file.mimetype;
                const buffer = file.buffer;
                if (mimetype === 'application/pdf') {
                    try {
                        const pdfData = await pdfParse(buffer);
                        fileTextContext += `\n\n[File: ${file.originalname}]\n${pdfData.text}`;
                    } catch (err) { console.error("PDF Parse Error:", err); }
                } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    try {
                        const docData = await mammoth.extractRawText({ buffer: buffer });
                        fileTextContext += `\n\n[File: ${file.originalname}]\n${docData.value}`;
                    } catch (err) { console.error("Docx Parse Error:", err); }
                } else if (mimetype.startsWith('text/')) {
                    fileTextContext += `\n\n[File: ${file.originalname}]\n${buffer.toString('utf8')}`;
                } else if (mimetype.startsWith('image/') && !imageBase64) {
                    imageBase64 = `data:${mimetype};base64,${buffer.toString('base64')}`;
                }
            }
        }

        // --- 🎨 IMAGE MODE: Generate unique image per model using Pollinations.ai ---
        if (isImageMode) {
            const prompt = historyObj.openai?.[historyObj.openai.length - 1]?.content || "";
            const promptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
            
            const [openaiImg, deepseekImg, metaImg, geminiImg] = await Promise.all([
                bypass.includes('openai')   ? { text: '', status: 'skipped', skipped: true } : generateImagePollinations(promptText, 'openai'),
                bypass.includes('deepseek') ? { text: '', status: 'skipped', skipped: true } : generateImagePollinations(promptText, 'deepseek'),
                bypass.includes('meta')     ? { text: '', status: 'skipped', skipped: true } : generateImagePollinations(promptText, 'meta'),
                bypass.includes('gemini')   ? { text: '', status: 'skipped', skipped: true } : generateImagePollinations(promptText, 'gemini'),
            ]);
            
            const imgResults = { openai: openaiImg, deepseek: deepseekImg, meta: metaImg, gemini: geminiImg };

            // Deduct credits
            let user = req.user;
            let creditsToDeduct = totalCost;
            if (user.dailyFreeCredits >= creditsToDeduct) {
                user.dailyFreeCredits -= creditsToDeduct;
            } else {
                creditsToDeduct -= user.dailyFreeCredits;
                user.dailyFreeCredits = 0;
                user.credits = Math.max(0, user.credits - creditsToDeduct);
            }
            await user.save();

            return res.json({ ...imgResults, analysis: null, remainingCredits: req.user.credits });
        }

        // --- 🔍 DEEP SEARCH MODE (Temporal Knowledge Injection) ---
        let searchContext = "";
        if (isSearchMode) {
            const now = new Date();
            searchContext = `\n\n[DEEP SEARCH ACTIVE — Today is ${now.toLocaleDateString('en-US', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}]: 
            You are operating in Deep Search Mode. Start your reply with a "[LIVE DATA]" tag. 
            Always mention the current date. Prioritize the most recent information available. 
            If discussing events, explicitly state the timeframe. Be extremely precise about temporal facts.`;
        }

        // --- 🧠 LONG-TERM MEMORY RETRIEVAL ---
        let memoryContext = "";
        try {
            const recentChats = await Chat.find({ userId: req.user._id })
                .sort({ createdAt: -1 })
                .limit(5);
            
            if (recentChats.length > 0) {
                memoryContext = "\n\n[LONG-TERM MEMORY]: Your previous interactions with this user include:\n" + 
                    recentChats.reverse().map(c => `- Topic: ${c.prompt.substring(0, 100)}...`).join('\n') +
                    "\nUse this context to maintain continuity and remember the user's preferences across weeks/months.";
            }
        } catch (memErr) {
            console.error("Memory Retrieval Error:", memErr);
        }

        const runModel = async (modelName, apiCallFunc) => {
            if (bypass.includes(modelName)) return { text: "", time: 0, skipped: true };
            if (!historyObj[modelName]) return { text: "", time: 0, skipped: true };
            
            const msgs = JSON.parse(JSON.stringify(historyObj[modelName]));
            const systemPrompt = {
                role: 'system',
                content: `You are an absolute genius-level AI assistant integrated into AIFusion. 
                You are currently communicating with ${req.user.name || 'a valued user'}. 
                Always greet them warmly by their name when starting a conversation. 
                Maintain a professional, helpful, and high-tech persona. 
                Use high-quality, aesthetic markdown formatting, bullet points, and code blocks in your responses.${memoryContext}${searchContext}`
            };
            if (msgs.length === 0 || msgs[0].role !== 'system') msgs.unshift(systemPrompt);
            if (msgs.length <= 1) return { text: "", time: 0, skipped: true };
            
            let lastMsg = msgs[msgs.length - 1];
            if (lastMsg.role === 'user') {
                if (fileTextContext) lastMsg.content += fileTextContext;
                if (imageBase64) {
                    const originalText = lastMsg.content;
                    lastMsg.content = [
                        { type: "text", text: originalText },
                        { type: "image_url", image_url: { url: imageBase64 } }
                    ];
                }
            }

            if (isImageMode && modelName === 'openai') {
                const prompt = typeof lastMsg.content === 'string' ? lastMsg.content : lastMsg.content[0].text;
                return await generateImageDALLE(prompt);
            }

            // --- ⚡ TIMEOUT SYSTEM (10s) ---
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('TIMEOUT')), 10000)
            );

            try {
                return await Promise.race([apiCallFunc(msgs), timeoutPromise]);
            } catch (err) {
                if (err.message === 'TIMEOUT') {
                    console.error(`Model ${modelName} timed out after 10s`);
                    return { text: "Response timed out after 10s.", time: 10000, status: "error", error: "TIMEOUT" };
                }
                throw err;
            }
        };

        const [openaiRes, deepseekRes, metaRes, geminiRes] = await Promise.all([
            runModel('openai', callOpenAI),
            runModel('deepseek', callDeepseek),
            runModel('meta', callMeta),
            runModel('gemini', callGemini)
        ]);

        const results = {
            openai: openaiRes,
            deepseek: deepseekRes,
            meta: metaRes,
            gemini: geminiRes
        };

        // --- 📊 DEDUCT CREDITS & LOG USAGE ---
        let user = req.user;
        let creditsToDeduct = totalCost;

        // Deduct from daily free first
        if (user.dailyFreeCredits >= creditsToDeduct) {
            user.dailyFreeCredits -= creditsToDeduct;
            creditsToDeduct = 0;
        } else {
            creditsToDeduct -= user.dailyFreeCredits;
            user.dailyFreeCredits = 0;
            user.credits = Math.max(0, user.credits - creditsToDeduct);
        }
        await user.save();

        // Log each model's usage
        const usageLogs = Object.entries(results)
            .filter(([k, v]) => v && !v.skipped)
            .map(([model, res]) => ({
                userId: user._id,
                model: model,
                tokens: {
                    total: res.tokens || 0
                },
                cost: ((res.tokens || 0) / 1000) * (MODEL_PRICING[model] || 0),
                creditsUsed: MODEL_COSTS[model] || 0
            }));
        
        if (usageLogs.length > 0) {
            await Usage.insertMany(usageLogs);
        }

        const validResponses = Object.entries(results).filter(([k, v]) => !v.skipped && v.status === "success");
        
        // If only one model was requested (for independent loading), return immediately without analysis
        if (activeModels.length === 1) {
            return res.json({
                ...results,
                analysis: null,
                remainingCredits: user.credits
            });
        }

        let analysis = null;
        if (validResponses.length > 0) {
            try {
                const prompt = historyObj.openai?.[historyObj.openai.length - 1]?.content || "";
                const promptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
                
                // --- 🧠 NEW AI FUSION SYSTEM ---
                const [evalData, summary, agreement] = await Promise.all([
                    evaluateResponses(promptText, results),
                    generateSummary(promptText, results),
                    detectAgreement(promptText, results)
                ]);

                analysis = {
                    ...evalData,
                    ultimateSynthesis: summary,
                    agreementPercentage: agreement?.agreementPercentage || 0,
                    disagreement: agreement?.disagreement || false,
                    consensus: agreement?.consensusSummary || ""
                };
            } catch (anaErr) { console.error("Analysis Error:", anaErr); }
        }

        // --- 📊 UPDATE STREAK & STATS ---
        await updateStreak(user);

        // --- 💾 SAVE CHAT HISTORY ---
        try {
            const prompt = historyObj.openai?.[historyObj.openai.length - 1]?.content || "";
            const promptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
            
            // Generate title only if it's the first message or if it's a new session
            const title = await generateTitle(promptText);

            await Chat.create({
                userId: user._id,
                prompt: promptText,
                title: title,
                responses: {
                    openai: results.openai?.status === "success" ? { text: results.openai.text } : null,
                    deepseek: results.deepseek?.status === "success" ? { text: results.deepseek.text } : null,
                    meta: results.meta?.status === "success" ? { text: results.meta.text } : null,
                    gemini: results.gemini?.status === "success" ? { text: results.gemini.text } : null
                },
                consensus: analysis?.consensus || "",
                ultimateSynthesis: analysis?.ultimateSynthesis || "",
                bestModel: analysis?.bestModel || "",
                imageMode: isImageMode,
                searchMode: isSearchMode
            });
        } catch (saveErr) {
            console.error("Chat Save Error:", saveErr);
        }

        return res.json({
            ...results,
            analysis,
            remainingCredits: user.credits
        });

    } catch (error) {
        console.error('Chat Error:', error);
        return res.status(500).json({ error: 'Backend Server Error' });
    }
});

app.post('/api/analyze', authMiddleware, async (req, res) => {
    try {
        const { prompt, results } = req.body;
        if (!prompt || !results) return res.status(400).json({ error: 'Missing prompt or results' });

        const [evalData, summary, agreement] = await Promise.all([
            evaluateResponses(prompt, results),
            generateSummary(prompt, results),
            detectAgreement(prompt, results)
        ]);

        const analysis = {
            ...evalData,
            ultimateSynthesis: summary,
            agreementPercentage: agreement?.agreementPercentage || 0,
            disagreement: agreement?.disagreement || false,
            consensus: agreement?.consensusSummary || ""
        };

        return res.json({ analysis });
    } catch (error) {
        console.error('Analyze Error:', error);
        return res.status(500).json({ error: error.message });
    }
});

app.post('/api/resolve-debate', authMiddleware, async (req, res) => {
    try {
        const { prompt, results } = req.body;
        if (!prompt || !results) return res.status(400).json({ error: 'Missing prompt or results' });

        const resolution = await resolveDisagreement(prompt, results);
        return res.json({ resolution });
    } catch (error) {
        console.error('Resolve Debate Error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// AI Debate Mode: each model critiques the others' responses
const handleDebateRequest = async (req, res) => {
    try {
        const { responses, originalPrompt } = req.body;
        if (!responses || !originalPrompt) return res.status(400).json({ error: 'Missing responses or prompt' });

        const modelNames = { openai: 'GPT-4o (OpenAI)', deepseek: 'DeepSeek', meta: 'Llama (Meta)', gemini: 'Gemini (Google)' };
        const modelKeys = ['openai', 'deepseek', 'meta', 'gemini'];
        const callFns = { openai: callOpenAI, deepseek: callDeepseek, meta: callMeta, gemini: callGemini };

        const debateRound = await Promise.all(modelKeys.map(async (model) => {
            if (!responses[model]) return { model, text: '', skipped: true };
            const othersText = modelKeys
                .filter(m => m !== model && responses[m])
                .map(m => `**${modelNames[m]} said:**\n"${responses[m].substring(0, 600)}..."`)
                .join('\n\n');

            const debatePrompt = [
                { role: 'system', content: `You are ${modelNames[model]}, participating in an AI debate panel. Be direct, sharp, and intellectually rigorous. You may agree, disagree, or extend other AI models' reasoning. Use markdown.` },
                { role: 'user', content: `Original question: "${originalPrompt}"\n\nHere is what the other AI models said:\n\n${othersText}\n\nNow, as ${modelNames[model]}: Critically engage with their answers. Point out what you agree with, what you think is wrong or incomplete, and add your own unique insight that the others missed. Be specific and direct.` }
            ];

            try {
                const result = await callFns[model](debatePrompt);
                return { model, text: result.text || '', status: result.status };
            } catch (e) {
                return { model, text: '', status: 'error' };
            }
        }));

        const debateResults = {};
        debateRound.forEach(({ model, text, status }) => { debateResults[model] = { text, status }; });

        // Deduct credits (flat cost for debate round)
        const totalCost = 8;
        let user = req.user;
        if (user.dailyFreeCredits >= totalCost) { user.dailyFreeCredits -= totalCost; }
        else { const rem = totalCost - user.dailyFreeCredits; user.dailyFreeCredits = 0; user.credits = Math.max(0, user.credits - rem); }
        await user.save();

        return res.json({ debate: debateResults, remainingCredits: user.credits });
    } catch (e) {
        console.error('Debate Error:', e);
        return res.status(500).json({ error: e.message });
    }
};

app.post('/api/debate',    authMiddleware, billingMiddleware, handleDebateRequest);
app.post('/api/v1/debate', authMiddleware, billingMiddleware, handleDebateRequest);

app.post('/api/improve-prompt', authMiddleware, async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "No prompt provided" });
        const improved = await improvePrompt(prompt);
        return res.json({ improved });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.use((err, req, res, next) => {
    console.error('Express Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AIFusion Backend ready on http://localhost:${PORT}`);
    console.log(`📡 Diagnostic endpoint: http://localhost:${PORT}/api/test`);
});
