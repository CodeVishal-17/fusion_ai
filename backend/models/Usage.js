const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    model: { type: String, required: true },
    tokens: {
        prompt: Number,
        completion: Number,
        total: Number
    },
    cost: Number, // Internal API cost in USD
    creditsUsed: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usage', usageSchema);
