const express = require('express');
const { getBrands, createBrand } = require('../controllers/brandController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getBrands).post(protect, admin, createBrand);

module.exports = router;
