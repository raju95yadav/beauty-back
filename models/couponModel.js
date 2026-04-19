const mongoose = require('mongoose');

const couponSchema = mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        discount: {
            type: Number,
            required: true,
            default: 0,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        minOrderAmount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
