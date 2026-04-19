const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, async (req, res) => {
    res.json({
        email: req.user.email,
        credits: req.user.credits,
        plan: req.user.plan
    });
});

module.exports = router;
