const express = require('express');
const { getCart, addToCart, removeFromCart, updateCartItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getCart).delete(protect, clearCart);
router.route('/add').post(protect, addToCart);
router.route('/remove/:productId').delete(protect, removeFromCart);
router.route('/update').put(protect, updateCartItem);

module.exports = router;