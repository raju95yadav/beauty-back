const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, logout, login, adminLogin, updateAdminPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/admin-login', adminLogin);
router.put('/update-admin-password', protect, updateAdminPassword);
router.post('/login', login); // Keeping for backward compatibility
router.post('/logout', logout);

module.exports = router;
