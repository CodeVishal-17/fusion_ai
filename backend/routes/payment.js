const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

// --- 💳 CREATE ORDER ---
router.post('/create-order', authMiddleware, async (req, res) => {
    try {
        const { amount, planType } = req.body; // amount in INR
        
        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                planType: planType
            }
        };

        console.log(`[PAYMENT] Creating order for amount: ₹${amount}, Plan: ${planType}`);
        const order = await razorpay.orders.create(options);
        console.log(`[PAYMENT] Order created successfully: ${order.id}`);
        res.json(order);
    } catch (error) {
        console.error('[PAYMENT_ERROR]', error);
        res.status(500).json({ error: error.message });
    }
});

// --- ✅ VERIFY PAYMENT ---
router.post('/verify', authMiddleware, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            const user = await User.findById(req.user._id);
            
            // Add credits based on plan
            if (planType === 'starter') {
                user.credits += 500;
            } else if (planType === 'pro') {
                user.credits += 1500;
                user.plan = 'pro';
            } else if (planType === 'subscription') {
                user.plan = 'pro';
                user.dailyFreeCredits = 100; // Boosted daily limit
                user.subscriptionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            }

            await user.save();
            res.json({ status: 'ok', credits: user.credits, plan: user.plan });
        } else {
            res.status(400).json({ error: 'Invalid signature' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
