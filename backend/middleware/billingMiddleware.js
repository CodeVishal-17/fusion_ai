const User = require('../models/User');

// Daily free credit allowances per plan
const DAILY_CREDITS = {
    free: 70,
    pro: 70,
    admin: 10000,
};

const billingMiddleware = async (req, res, next) => {
    try {
        const user = req.user;
        const now = new Date();
        const lastReset = new Date(user.lastResetDate);

        // --- ⏳ DAILY RESET LOGIC ---
        // If the calendar day has changed, RESET dailyFreeCredits to the plan allowance.
        // This is a RESET (not an add). Unused daily credits do NOT carry over.
        // Purchased credits (user.credits) are NEVER touched here.
        if (now.toDateString() !== lastReset.toDateString()) {
            const dailyAllowance = DAILY_CREDITS[user.plan] || DAILY_CREDITS.free;
            user.dailyFreeCredits = dailyAllowance; // Always reset TO the allowance, not ADD
            user.lastResetDate = now;
            await user.save();
        }

        // --- 🛡️ CREDIT CHECK LOGIC ---
        if (req.path === '/chat') {
            const { bypassModels } = req.body;
            const bypass = Array.isArray(bypassModels) ? bypassModels : [];
            const activeModelsCount = ['openai', 'deepseek', 'meta', 'gemini'].filter(m => !bypass.includes(m)).length;

            const estimatedRequired = activeModelsCount * 5;
            // Total balance = daily free + purchased credits
            const availableBalance = (user.dailyFreeCredits || 0) + (user.credits || 0);

            if (availableBalance <= 0) {
                return res.status(402).json({ 
                    error: 'INSUFFICIENT_CREDITS', 
                    message: 'You have run out of credits. Please purchase more or wait for your daily reset.',
                    dailyResetTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime()
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
