const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prompt: { type: String, required: true },
    responses: {
        openai: { text: String, metadata: Object },
        deepseek: { text: String, metadata: Object },
        meta: { text: String, metadata: Object },
        gemini: { text: String, metadata: Object }
    },
    consensus: { type: String },
    bestModel: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
