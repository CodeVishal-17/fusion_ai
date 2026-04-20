const Analytics = require('../models/Analytics');

/**
 * Logs an AI request for analytics.
 */
async function logRequest(userId, model, tokens, cost, responseTime, status) {
    try {
        await Analytics.create({
            userId,
            model,
            tokens,
            cost,
            responseTime,
            status
        });
    } catch (error) {
        console.error("Analytics Log Error:", error);
    }
}

/**
 * Retrieves aggregate usage stats for the user.
 */
async function getUserStats(userId) {
    try {
        const stats = await Analytics.aggregate([
            { $match: { userId: userId } },
            { $group: {
                _id: "$model",
                totalTokens: { $sum: "$tokens" },
                totalCost: { $sum: "$cost" },
                avgResponseTime: { $avg: "$responseTime" },
                count: { $sum: 1 }
            }}
        ]);
        return stats;
    } catch (error) {
        console.error("Analytics Retrieval Error:", error);
        return [];
    }
}

module.exports = { logRequest, getUserStats };
