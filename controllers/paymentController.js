const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/orderModel');

const razorpay = process.env.RAZORPAY_KEY ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
}) : null;


// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
    const { amount } = req.body;

    const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error('Razorpay Order Creation Failed');
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
        res.json({ status: 'success' });
    } else {
        res.status(400);
        throw new Error('Invalid signature, payment verification failed');
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPayment,
};
