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

        const userName = req.user.name || req.user.email || 'Customer';
        const shortId = createdOrder._id.toString().slice(-6).toUpperCase();
        await createAdminNotification({
            type: 'ORDER',
            message: `New order #${shortId} placed by ${userName} (₹${createdOrder.totalPrice})`,
            link: '/orders',
            adminId: null
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

// @desc    Cancel order by user
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to cancel this order');
        }

        if (order.orderStatus === 'Delivered') {
            res.status(400);
            throw new Error('Delivered orders cannot be cancelled');
        }

        if (order.orderStatus === 'Cancelled') {
            res.status(400);
            throw new Error('Order is already cancelled');
        }

        order.orderStatus = 'Cancelled';
        order.isCancelled = true;
        order.cancelledAt = Date.now();

        const updatedOrder = await order.save();

        // Restore product stock
        if (order.orderItems && order.orderItems.length > 0) {
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.qty;
                    await product.save();
                }
            }
        }

        // Real-time Admin Notification for order cancellation
        const userName = req.user.name || req.user.email || 'Customer';
        const shortId = order._id.toString().slice(-6).toUpperCase();
        await createAdminNotification({
            type: 'ORDER',
            message: `Order #${shortId} was cancelled by ${userName}`,
            link: '/orders',
            adminId: null
        });

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
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
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
};

module.exports = {
    addOrderItems,
    cancelOrder,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
};
