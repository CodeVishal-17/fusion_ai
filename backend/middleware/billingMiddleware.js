const User = require('../models/User');

const billingMiddleware = async (req, res, next) => {
    try {
        const user = req.user;
        const now = new Date();
        const lastReset = new Date(user.lastResetDate);

        // --- ⏳ DAILY RESET LOGIC ---
        // Check if day has changed since last reset
        if (now.toDateString() !== lastReset.toDateString()) {
            user.dailyFreeCredits = 20; // Default daily allowance
            user.lastResetDate = now;
            await user.save();
        }

        // --- 🛡️ CREDIT CHECK LOGIC ---
        // If it's a chat request, estimate cost
        if (req.path === '/chat') {
            const { bypassModels } = req.body;
            const bypass = Array.isArray(bypassModels) ? bypassModels : [];
            const activeModelsCount = ['openai', 'deepseek', 'meta', 'gemini'].filter(m => !bypass.includes(m)).length;
            
            // Rough estimate: 5 credits per model (max expected usage for a normal prompt)
            const estimatedRequired = activeModelsCount * 5;
            const availableBalance = (user.credits || 0) + (user.dailyFreeCredits || 0);

            if (availableBalance < estimatedRequired && availableBalance <= 0) {
                return res.status(402).json({ 
                    error: 'INSUFFICIENT_CREDITS', 
                    message: 'You have run out of credits. Please upgrade or wait for daily reset.',
                    resetTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime()
                });
            }
        }

        next();
    } catch (error) {
        console.error('Billing Middleware Error:', error);
        next(); // Proceed if billing fails to avoid blocking the user
    }
};

module.exports = billingMiddleware;
