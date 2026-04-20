const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for OAuth
    name: { type: String },
    authProvider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
    oauthId: { type: String },
    plan: { type: String, enum: ['free', 'pro', 'admin'], default: 'free' },
    credits: { type: Number, default: 50 },
    dailyFreeCredits: { type: Number, default: 70 },
    lastResetDate: { type: Date, default: Date.now },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    subscriptionExpires: { Date },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    totalQueries: { type: Number, default: 0 },
    apiKeys: {
        openai: { type: String },
        gemini: { type: String },
        anthropic: { type: String },
        perplexity: { type: String }
    },
    preferences: {
        tone: { type: String, default: 'balanced' },
        expertise: { type: String, default: 'general' },
        memoryEnabled: { type: Boolean, default: true }
    },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
