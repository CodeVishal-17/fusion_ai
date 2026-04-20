const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prompt: { type: String, required: true },
    title: { type: String, default: 'New Conversation' },
    isPinned: { type: Boolean, default: false },
    responses: {
        openai: { text: String, metadata: Object },
        deepseek: { text: String, metadata: Object },
        meta: { text: String, metadata: Object },
        gemini: { text: String, metadata: Object }
    },
    consensus: { type: String },
    ultimateSynthesis: { type: String },
    bestModel: { type: String },
    imageMode: { type: Boolean, default: false },
    searchMode: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
