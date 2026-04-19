const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const { createAdminNotification } = require('./notificationController');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid,
        paidAt,
        paymentResult,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else {
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid,
            paidAt,
            paymentResult,
            orderStatus: 'Confirmed',
            trackingData: {
                destinationCity: shippingAddress.city,
                estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            }
        });

        const createdOrder = await order.save();

        await createAdminNotification({
            type: 'ORDER',
            message: `New order placed: #${createdOrder._id.toString().slice(-6)}`,
            link: '/orders',
            adminId: null // Placed by user, not an admin action
        });

        // Reduce stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock -= item.qty;
                await product.save();
            }
        }

        res.status(201).json(createdOrder);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
};
