const Cart = require('../models/cartModel');

// @desc    Get logged in user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product', 'name price images');

    if (cart) {
        res.json(cart);
    } else {
        res.json({ cartItems: [] });
    }
};

// @desc    Add or update cart items
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
    const { productId, qty, price } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        const productIndex = cart.cartItems.findIndex((item) => item.product.toString() === productId);

        if (productIndex > -1) {
            cart.cartItems[productIndex].qty = qty;
        } else {
            cart.cartItems.push({ product: productId, qty, price });
        }
    } else {
        cart = new Cart({
            user: req.user._id,
            cartItems: [{ product: productId, qty, price }],
        });
    }

    const updatedCart = await cart.save();
    res.status(201).json(updatedCart);
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
const removeFromCart = async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.cartItems = cart.cartItems.filter((item) => item.product.toString() !== req.params.productId);
        await cart.save();
        res.json({ message: 'Item removed from cart' });
    } else {
        res.status(404);
        throw new Error('Cart not found');
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res) => {
    const { productId, qty } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        const item = cart.cartItems.find((item) => item.product.toString() === productId);
        if (item) {
            item.qty = qty;
            await cart.save();
            res.json(cart);
        } else {
            res.status(404);
            throw new Error('Item not found in cart');
        }
    } else {
        res.status(404);
        throw new Error('Cart not found');
    }
};

module.exports = { getCart, addToCart, removeFromCart, updateCartItem };
