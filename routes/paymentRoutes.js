const express = require('express');
const {
    createRazorpayOrder,
    verifyPayment,
} = require('../controllers/paymentController');
const { generateOrderInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/verify', protect, verifyPayment);
router.get('/invoice/:id', protect, generateOrderInvoice);

module.exports = router;
