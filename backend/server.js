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
        let { chatHistory, bypassModels } = req.body;
        
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
                Use high-quality, aesthetic markdown formatting, bullet points, and code blocks in your responses.`
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
            return await apiCallFunc(msgs);
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
        let analysis = null;
        if (validResponses.length > 1) {
            try {
                const prompt = historyObj.openai?.[historyObj.openai.length - 1]?.content || "";
                const promptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
                analysis = await analyzeResponses(promptText, results);
            } catch (anaErr) { console.error("Analysis Error:", anaErr); }
        }

        // --- 💾 SAVE CHAT HISTORY ---
        try {
            const prompt = historyObj.openai?.[historyObj.openai.length - 1]?.content || "";
            const promptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
            
            await Chat.create({
                userId: user._id,
                prompt: promptText,
                responses: {
                    openai: results.openai?.status === "success" ? { text: results.openai.text } : null,
                    deepseek: results.deepseek?.status === "success" ? { text: results.deepseek.text } : null,
                    meta: results.meta?.status === "success" ? { text: results.meta.text } : null,
                    gemini: results.gemini?.status === "success" ? { text: results.gemini.text } : null
                },
                consensus: analysis?.consensus || "",
                bestModel: analysis?.bestModel || ""
            });
        } catch (saveErr) {
            console.error("Chat Save Error:", saveErr);
        }

        return res.json({
            ...results,
            analysis,
            remainingCredits: req.user.credits
        });

    } catch (error) {
        console.error('Chat Error:', error);
        return res.status(500).json({ error: 'Backend Server Error' });
    }
});

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
