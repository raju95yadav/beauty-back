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
        // Strict Pre-flight Server-Side Stock Verification
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                res.status(400);
                throw new Error(`Product "${item.name}" was not found in inventory.`);
            }
            if (product.stock === 0) {
                res.status(400);
                throw new Error(`"${product.name}" is OUT OF STOCK. Please remove it from your bag to proceed.`);
            }
            if (item.qty > product.stock) {
                res.status(400);
                throw new Error(`Only ${product.stock} units of "${product.name}" are available in stock. You requested ${item.qty}. Please adjust your quantity.`);
            }
        }

        const trackingNum = `NYK-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const now = new Date();
        const estDelivery = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

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
            orderStatus: 'Order Placed',
            trackingData: {
                placedAt: now,
                destinationCity: shippingAddress.city,
                dispatchCity: 'Mumbai Central Warehouse',
                courierPartner: 'BlueDart Express',
                trackingNumber: trackingNum,
                estimatedDelivery: estDelivery,
                statusLogs: [
                    {
                        status: 'Order Placed',
                        title: 'Order Placed',
                        description: 'Your order has been received and verified by Glam Beauty.',
                        location: 'Mumbai Central Warehouse',
                        timestamp: now
                    }
                ]
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

        // Reduce stock & check for automated low stock alerts
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock = Math.max(0, product.stock - item.qty);
                await product.save();

                const threshold = product.lowStockThreshold || 5;
                if (product.stock <= threshold) {
                    const alertType = product.stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK';
                    await createAdminNotification({
                        type: 'PRODUCT',
                        message: `[${alertType} ALERT] "${product.name}" has only ${product.stock} items remaining in inventory!`,
                        link: '/manage-products',
                        adminId: null
                    });
                }
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

        const now = new Date();
        order.orderStatus = 'Cancelled';
        order.isCancelled = true;
        order.cancelledAt = now;
        order.trackingData = order.trackingData || {};
        order.trackingData.cancelledAt = now;
        order.trackingData.statusLogs = order.trackingData.statusLogs || [];
        order.trackingData.statusLogs.push({
            status: 'Cancelled',
            title: 'Order Cancelled',
            description: 'Order was cancelled by customer.',
            location: 'System',
            timestamp: now
        });

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

// @desc    Get detailed order tracking information
// @route   GET /api/orders/:id/tracking
// @access  Private
const getOrderTrackingDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to track this order' });
        }

        const stages = [
            { key: 'Order Placed', label: 'Order Placed', date: order.trackingData?.placedAt || order.createdAt },
            { key: 'Processing', label: 'Processing', date: order.trackingData?.processingAt },
            { key: 'Packed', label: 'Packed', date: order.trackingData?.packedAt },
            { key: 'Shipped', label: 'Shipped', date: order.trackingData?.shippedAt },
            { key: 'Out for Delivery', label: 'Out for Delivery', date: order.trackingData?.outForDeliveryAt },
            { key: 'Delivered', label: 'Delivered', date: order.trackingData?.deliveredAt || order.deliveredAt },
        ];

        let statusKey = order.orderStatus || 'Order Placed';
        if (statusKey === 'Confirmed') statusKey = 'Order Placed';

        const currentStageIndex = stages.findIndex(s => s.key === statusKey);
        const activeIndex = currentStageIndex >= 0 ? currentStageIndex : (order.isDelivered ? 5 : 0);
        const progressPercentage = (activeIndex / (stages.length - 1)) * 100;

        res.json({
            orderId: order._id,
            orderStatus: order.orderStatus,
            isCancelled: order.orderStatus === 'Cancelled' || order.isCancelled,
            cancelledAt: order.trackingData?.cancelledAt,
            stages,
            activeIndex,
            progressPercentage,
            trackingNumber: order.trackingData?.trackingNumber || `NYK-TRK-${order._id.toString().slice(-8).toUpperCase()}`,
            courierPartner: order.trackingData?.courierPartner || 'BlueDart Express',
            dispatchCity: order.trackingData?.dispatchCity || 'Mumbai Central Warehouse',
            destinationCity: order.trackingData?.destinationCity || order.shippingAddress?.city || 'Customer Destination',
            estimatedDelivery: order.trackingData?.estimatedDelivery || new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000),
            statusLogs: order.trackingData?.statusLogs && order.trackingData.statusLogs.length > 0 
                ? order.trackingData.statusLogs 
                : [
                    {
                        status: 'Order Placed',
                        title: 'Order Placed',
                        description: 'Your order has been received and verified by Glam Beauty.',
                        location: 'Mumbai Central Warehouse',
                        timestamp: order.createdAt
                    }
                ],
            shippingAddress: order.shippingAddress,
            orderItems: order.orderItems,
            totalPrice: order.totalPrice,
            isPaid: order.isPaid,
            paymentMethod: order.paymentMethod
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching tracking details' });
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
    getOrderTrackingDetails,
};
