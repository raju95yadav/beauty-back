const Brand = require('../models/brandModel');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = async (req, res) => {
    const brands = await Brand.find({});
    res.json(brands);
};

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private/Admin
const createBrand = async (req, res) => {
    const { name, image } = req.body;

    const brandExists = await Brand.findOne({ name });

    if (brandExists) {
        res.status(400);
        throw new Error('Brand already exists');
    }

    const brand = await Brand.create({ name, image });
    res.status(201).json(brand);
};

module.exports = { getBrands, createBrand };
