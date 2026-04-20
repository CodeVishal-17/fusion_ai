const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    steps: [{
        model: { type: String, required: true },
        instruction: { type: String, required: true },
        type: { type: String, enum: ['research', 'summarize', 'critique', 'final'], default: 'research' }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workflow', workflowSchema);
