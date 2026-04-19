const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const user = new User({ email, password });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'supersecret');
        res.status(201).json({ user: { email: user.email, credits: user.credits, plan: user.plan }, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'supersecret');
        res.json({ user: { email: user.email, credits: user.credits, plan: user.plan }, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Social Login (Google/GitHub)
router.post('/social-login', async (req, res) => {
    try {
        const { email, name, authProvider, oauthId, isSimulation } = req.body;
        
        let user = await User.findOne({ email });
        
        if (!user) {
            // Create new user with social defaults
            user = new User({ 
                email, 
                name: name || (isSimulation ? `Tester_${authProvider}` : 'Social User'), 
                authProvider, 
                oauthId: oauthId || (isSimulation ? `sim_${Date.now()}` : null),
                credits: 50, // Initial free credits
                dailyFreeCredits: 20
            });
            await user.save();
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'supersecret');
        res.json({ 
            user: { 
                email: user.email, 
                name: user.name,
                credits: user.credits, 
                dailyFreeCredits: user.dailyFreeCredits,
                plan: user.plan 
            }, 
            token,
            mode: isSimulation ? 'sandbox' : 'live'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
