const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    model: { type: String, required: true },
    tokens: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    responseTime: { type: Number }, // ms
    status: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
