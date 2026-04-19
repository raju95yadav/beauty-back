const Coupon = require('../models/couponModel');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
    const { code, discount, expiryDate, minOrderAmount } = req.body;

    const couponExists = await Coupon.findOne({ code });

    if (couponExists) {
        res.status(400);
        throw new Error('Coupon code already exists');
    }

    const coupon = await Coupon.create({
        code,
        discount,
        expiryDate,
        minOrderAmount,
    });

    res.status(201).json(coupon);
};

// @desc    Validate a coupon
// @route   POST /api/coupons/apply
// @access  Private
const validateCoupon = async (req, res) => {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({ code, isActive: true });

    if (coupon && coupon.expiryDate > Date.now()) {
        if (orderAmount >= coupon.minOrderAmount) {
            res.json({
                valid: true,
                discount: coupon.discount,
                message: 'Coupon applied successfully',
            });
        } else {
            res.status(400);
            throw new Error(`Minimum order amount for this coupon is ${coupon.minOrderAmount}`);
        }
    } else {
        res.status(400);
        throw new Error('Invalid or expired coupon code');
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
    const coupons = await Coupon.find({});
    res.json(coupons);
};

module.exports = { createCoupon, validateCoupon, getCoupons };
