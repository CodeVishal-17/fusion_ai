const express = require('express');
const router = express.Router();
const Support = require('../models/Support');
const authMiddleware = require('../middleware/authMiddleware');

const ADMIN_EMAIL = 'goyalvishal7711@gmail.com';

// ─── USER ROUTES ──────────────────────────────────────────────────────────────

// Submit feedback, help request, or model request
router.post('/submit', authMiddleware, async (req, res) => {
    try {
        const { type, message, modelName, modelUrl } = req.body;
        
        if (!type || !message) {
            return res.status(400).json({ error: 'Type and message are required.' });
        }
        if (!['feedback', 'help', 'model_request'].includes(type)) {
            return res.status(400).json({ error: 'Invalid ticket type.' });
        }

        const ticket = new Support({
            type,
            userId: req.user._id,
            userEmail: req.user.email,
            userName: req.user.name || req.user.email,
            message,
            modelName: modelName || '',
            modelUrl: modelUrl || '',
        });
        await ticket.save();

        res.status(201).json({ message: 'Submitted successfully!', ticketId: ticket._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current user's own tickets (to see admin replies)
router.get('/my-tickets', authMiddleware, async (req, res) => {
    try {
        const tickets = await Support.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

function adminOnly(req, res, next) {
    if (req.user.email !== ADMIN_EMAIL && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
}

// Get all tickets (admin only)
router.get('/admin/all', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { type, status } = req.query;
        const filter = {};
        if (type) filter.type = type;
        if (status) filter.status = status;

        const tickets = await Support.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get summary stats (admin only)
router.get('/admin/stats', authMiddleware, adminOnly, async (req, res) => {
    try {
        const [total, open, feedback, help, modelReq] = await Promise.all([
            Support.countDocuments(),
            Support.countDocuments({ status: 'open' }),
            Support.countDocuments({ type: 'feedback' }),
            Support.countDocuments({ type: 'help' }),
            Support.countDocuments({ type: 'model_request' }),
        ]);
        res.json({ total, open, feedback, help, modelRequests: modelReq });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reply to a ticket (admin only)
router.post('/admin/reply/:ticketId', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { reply } = req.body;
        if (!reply) return res.status(400).json({ error: 'Reply cannot be empty.' });

        const ticket = await Support.findById(req.params.ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

        ticket.adminReply = reply;
        ticket.status = 'replied';
        ticket.repliedAt = new Date();
        await ticket.save();

        res.json({ message: 'Reply sent!', ticket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update ticket status (admin only)
router.patch('/admin/status/:ticketId', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Support.findByIdAndUpdate(
            req.params.ticketId, 
            { status }, 
            { new: true }
        );
        if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
        res.json({ message: 'Status updated', ticket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
