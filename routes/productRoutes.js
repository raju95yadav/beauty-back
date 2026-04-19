const express = require('express');
const {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    createProductReview,
    getProductsByCategory,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary.js');

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, upload.array('images', 5), createProduct);
router.route('/category/:categoryName').get(getProductsByCategory);
router
    .route('/:id')
    .get(getProductById)
    .delete(protect, admin, deleteProduct)
    .put(protect, admin, upload.array('images', 5), updateProduct);
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;
