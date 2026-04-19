const Review = require('../models/reviewModel');
const Product = require('../models/productModel');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    const { rating, comment, productId } = req.body;

    const product = await Product.findById(productId);

    if (product) {
        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            product: productId,
        });

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }

        const review = await Review.create({
            user: req.user._id,
            product: productId,
            name: req.user.name,
            rating: Number(rating),
            comment,
        });

        // Update product rating
        const reviews = await Review.find({ product: productId });
        product.numReviews = reviews.length;
        product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await product.save();

        res.status(201).json(review);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.json(reviews);
};

module.exports = { createReview, getProductReviews };
