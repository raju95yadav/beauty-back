const express = require('express');
const { createCoupon, validateCoupon, getCoupons } = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);
router.route('/apply').post(protect, validateCoupon);

module.exports = router;
