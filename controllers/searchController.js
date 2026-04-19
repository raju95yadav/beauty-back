const Product = require('../models/productModel');

// @desc    Search products
// @route   GET /api/search
// @access  Public
const searchProducts = async (req, res) => {
    const q = req.query.q;

    if (!q) {
        return res.json([]);
    }

    const products = await Product.find({
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { brand: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } },
        ],
    }).select('name images price brand');

    res.json(products);
};

// @desc    Get search suggestions
// @route   GET /api/search/suggestions
// @access  Public
const getSearchSuggestions = async (req, res) => {
    const q = req.query.q;

    if (!q) {
        return res.json([]);
    }

    const suggestions = await Product.find({
        name: { $regex: q, $options: 'i' },
    }).limit(5).select('name');

    res.json(suggestions.map(s => s.name));
};

module.exports = { searchProducts, getSearchSuggestions };
