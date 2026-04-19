const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['feedback', 'help', 'model_request'], 
        required: true 
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, default: 'Anonymous' },
    // For feedback & help
    message: { type: String, required: true },
    // For model_request
    modelName: { type: String },
    modelUrl: { type: String },
    // Admin response
    status: { type: String, enum: ['open', 'replied', 'resolved'], default: 'open' },
    adminReply: { type: String, default: '' },
    repliedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Support', supportSchema);
