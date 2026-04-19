const express = require('express');
const { searchProducts, getSearchSuggestions } = require('../controllers/searchController');

const router = express.Router();

router.route('/').get(searchProducts);
router.route('/suggestions').get(getSearchSuggestions);

module.exports = router;
