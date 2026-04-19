const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Chat = require('../models/Chat');

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
    res.json({
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        credits: req.user.credits,
        dailyFreeCredits: req.user.dailyFreeCredits,
        plan: req.user.plan,
        authProvider: req.user.authProvider,
        createdAt: req.user.createdAt
    });
});

// Update user profile
router.put('/update', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: "Name must be at least 2 characters long." });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.name = name.trim();
        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                credits: user.credits,
                plan: user.plan
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user synthesis history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
