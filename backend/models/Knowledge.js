const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileType: { type: String },
    chunks: [{
        text: String,
        embedding: [Number],
        metadata: Object
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Knowledge', knowledgeSchema);
