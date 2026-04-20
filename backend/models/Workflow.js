const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    steps: [{
        model: { type: String, required: true },
        instruction: { type: String, required: true },
        order: { type: Number, required: true }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workflow', workflowSchema);
