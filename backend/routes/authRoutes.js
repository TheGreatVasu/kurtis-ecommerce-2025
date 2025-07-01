const express = require('express');
const {
    register,
    login,
    getMe,
    adminLogin,
    adminMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword,
    createFirstAdmin,
    resetAdminForDev
} = require('../controllers/authController');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Development only route - will only work if NODE_ENV is development
router.post('/reset-admin-dev', resetAdminForDev);

// Create first admin (only works if no admin exists)
router.post('/create-first-admin', createFirstAdmin);

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/admin-login', adminLogin);
router.get('/admin-me', protect, (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access only' });
    }
    res.json({ success: true, admin: { name: req.user.name, email: req.user.email, role: req.user.role } });
});

// --- Users endpoints for admin panel ---
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/users/summary', protect, admin, async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ success: true, count });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router; 