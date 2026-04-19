const Wishlist = require('../models/wishlistModel');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name price images brand');

    if (wishlist) {
        res.json(wishlist);
    } else {
        res.json({ products: [] });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
const addToWishlist = async (req, res) => {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
        }
    } else {
        wishlist = await Wishlist.create({
            user: req.user._id,
            products: [productId],
        });
    }

    res.status(201).json(wishlist);
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
        wishlist.products = wishlist.products.filter((id) => id.toString() !== req.params.productId);
        await wishlist.save();
        res.json({ message: 'Product removed from wishlist' });
    } else {
        res.status(404);
        throw new Error('Wishlist not found');
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
