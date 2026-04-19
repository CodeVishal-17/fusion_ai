const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'goyalvishal7711@gmail.com';
const ADMIN_DAILY_CREDITS = 10000;

// Helper: ensure admin privileges on every login
async function ensureAdminPrivileges(user) {
    if (user.email === ADMIN_EMAIL) {
        user.dailyFreeCredits = ADMIN_DAILY_CREDITS;
        user.credits = Math.max(user.credits || 0, 10000);
        user.plan = 'admin';
        user.role = 'admin';
        await user.save();
    }
    return user;
}

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { email: rawEmail, password } = req.body;
        const email = rawEmail.toLowerCase();
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const isAdmin = email === ADMIN_EMAIL;
        const user = new User({ 
            email, 
            password,
            dailyFreeCredits: isAdmin ? ADMIN_DAILY_CREDITS : 20,
            credits: isAdmin ? 10000 : 0,
            plan: isAdmin ? 'admin' : 'free',
            role: isAdmin ? 'admin' : 'user'
        });
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
        const { email: rawEmail, password } = req.body;
        const email = rawEmail.toLowerCase();
        
        let user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        user = await ensureAdminPrivileges(user);

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'supersecret');
        res.json({ user: { email: user.email, name: user.name, credits: user.credits, dailyFreeCredits: user.dailyFreeCredits, plan: user.plan }, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Social Login (Google/GitHub)
router.post('/social-login', async (req, res) => {
    try {
        const { email: rawEmail, name, authProvider, oauthId, isSimulation } = req.body;
        const email = rawEmail.toLowerCase();
        
        let user = await User.findOne({ email });
        
        if (!user) {
            const isAdmin = email === ADMIN_EMAIL;
            user = new User({ 
                email, 
                name: name || (isSimulation ? `Tester_${authProvider}` : 'Social User'), 
                authProvider, 
                oauthId: oauthId || (isSimulation ? `sim_${Date.now()}` : null),
                credits: isAdmin ? 10000 : 50,
                dailyFreeCredits: isAdmin ? ADMIN_DAILY_CREDITS : 20,
                plan: isAdmin ? 'admin' : 'free',
                role: isAdmin ? 'admin' : 'user'
            });
            await user.save();
        }

        user = await ensureAdminPrivileges(user);

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'supersecret');
        res.json({ 
            user: { email: user.email, name: user.name, credits: user.credits, dailyFreeCredits: user.dailyFreeCredits, plan: user.plan }, 
            token,
            mode: isSimulation ? 'sandbox' : 'live'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// One-time admin seed endpoint (idempotent)
router.post('/seed-admin', async (req, res) => {
    try {
        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            await ensureAdminPrivileges(existing);
            return res.json({ message: 'Admin privileges refreshed', email: ADMIN_EMAIL });
        }
        const hashed = await bcrypt.hash('Vishal17__', 10);
        const admin = new User({
            email: ADMIN_EMAIL,
            name: 'Vishal Goyal',
            password: hashed,
            authProvider: 'local',
            dailyFreeCredits: ADMIN_DAILY_CREDITS,
            credits: 10000,
            plan: 'admin',
            role: 'admin'
        });
        await admin.save();
        res.json({ message: 'Admin account created', email: ADMIN_EMAIL });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

