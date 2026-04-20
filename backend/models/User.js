const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
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

// Hash password and encrypt keys before saving
userSchema.pre('save', async function() {
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    if (this.isModified('apiKeys')) {
        if (this.apiKeys.openai) this.apiKeys.openai = encrypt(this.apiKeys.openai);
        if (this.apiKeys.gemini) this.apiKeys.gemini = encrypt(this.apiKeys.gemini);
        if (this.apiKeys.anthropic) this.apiKeys.anthropic = encrypt(this.apiKeys.anthropic);
        if (this.apiKeys.perplexity) this.apiKeys.perplexity = encrypt(this.apiKeys.perplexity);
    }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get decrypted keys
userSchema.methods.getDecryptedKeys = function() {
    return {
        openai: decrypt(this.apiKeys?.openai),
        gemini: decrypt(this.apiKeys?.gemini),
        anthropic: decrypt(this.apiKeys?.anthropic),
        perplexity: decrypt(this.apiKeys?.perplexity)
    };
};

module.exports = mongoose.model('User', userSchema);
