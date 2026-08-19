const User = require('../models/User');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const { createAdminNotification } = require('./notificationController');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const users = await User.find({});
    res.json(users);
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name email phone').sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Delete product
// @route   DELETE /api/admin/product/:id
// @access  Private/Admin
const deleteProductAdmin = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await Product.findByIdAndDelete(req.params.id);
        
        await createAdminNotification({
            type: 'PRODUCT',
            message: `Product removed by admin: ID ${req.params.id}`,
            link: '/manage-products',
            adminId: req.user._id
        });

        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Update order status
// @route   PUT /api/admin/order/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            const now = new Date();
            order.orderStatus = status;
            order.isDelivered = status === 'Delivered';

            order.trackingData = order.trackingData || {};
            order.trackingData.statusLogs = order.trackingData.statusLogs || [];

            let logTitle = `Order ${status}`;
            let logDescription = `Order status changed to ${status}.`;
            let logLocation = 'Fulfilment Center (Mumbai)';

            if (status === 'Order Placed' || status === 'Confirmed') {
                order.trackingData.placedAt = now;
                logTitle = 'Order Placed';
                logDescription = 'Order received and verified by system.';
                logLocation = 'Mumbai Central Warehouse';
            } else if (status === 'Processing') {
                order.trackingData.processingAt = now;
                logTitle = 'Processing & Allocation';
                logDescription = 'Items allocated and being inspected for packaging.';
                logLocation = 'Warehouse Processing Bay 4';
            } else if (status === 'Packed') {
                order.trackingData.packedAt = now;
                logTitle = 'Packed & Quality Verified';
                logDescription = 'Package sealed in tamper-proof box and ready for dispatch.';
                logLocation = 'Dispatch Hub (Mumbai)';
            } else if (status === 'Shipped') {
                order.trackingData.shippedAt = now;
                logTitle = 'Shipped & In Transit';
                logDescription = 'Package handed over to BlueDart courier partner.';
                logLocation = 'Logistics Sorting Facility';
            } else if (status === 'Out for Delivery') {
                order.trackingData.outForDeliveryAt = now;
                logTitle = 'Out for Delivery';
                logDescription = 'Delivery executive is en route with your parcel.';
                logLocation = `${order.shippingAddress?.city || 'Local'} Delivery Hub`;
            } else if (status === 'Delivered') {
                order.deliveredAt = now;
                order.trackingData.deliveredAt = now;
                logTitle = 'Package Delivered';
                logDescription = 'Handed directly to recipient at shipping address.';
                logLocation = `${order.shippingAddress?.street || 'Destination Address'}`;
            } else if (status === 'Cancelled') {
                order.isCancelled = true;
                order.trackingData.cancelledAt = now;
                logTitle = 'Order Cancelled';
                logDescription = 'Order has been cancelled by administrator.';
                logLocation = 'System Admin';
            }

            // Append status log
            order.trackingData.statusLogs.push({
                status,
                title: logTitle,
                description: logDescription,
                location: logLocation,
                timestamp: now
            });

            const updatedOrder = await order.save();

            await createAdminNotification({
                type: 'ORDER',
                message: `Order #${order._id.toString().slice(-6)} status updated to ${status}`,
                link: '/orders',
                adminId: req.user._id
            });

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const productsCount = await Product.countDocuments();
        const orders = await Order.find({});
        const ordersCount = orders.length;
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        // Real sales data — aggregate orders by month
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const salesAgg = await Order.aggregate([
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    sales: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);
        // Build sales data with all months, filling gaps with 0
        const salesData = monthNames.map((name, i) => {
            const found = salesAgg.find(s => s._id === i + 1);
            return { name, sales: found ? Math.round(found.sales) : 0 };
        });

        // Real category data — aggregate products by category
        const categoryAgg = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    value: { $sum: 1 }
                }
            },
            { $sort: { value: -1 } }
        ]);
        const categoryData = categoryAgg.map(c => ({
            name: c._id || 'Uncategorized',
            value: c.value
        }));

        // Real recent orders
        const recentOrders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Growth calculation: compare last 30 days vs previous 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

        const currentPeriodRevenue = orders
            .filter(o => new Date(o.createdAt) >= thirtyDaysAgo)
            .reduce((acc, o) => acc + (o.totalPrice || 0), 0);

        const previousPeriodRevenue = orders
            .filter(o => new Date(o.createdAt) >= sixtyDaysAgo && new Date(o.createdAt) < thirtyDaysAgo)
            .reduce((acc, o) => acc + (o.totalPrice || 0), 0);

        const growthPercent = previousPeriodRevenue > 0
            ? (((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100).toFixed(1)
            : currentPeriodRevenue > 0 ? '100.0' : '0.0';

        // Low stock & out of stock metrics
        const lowStockItems = await Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).lean();
        const lowStockCount = lowStockItems.filter(p => p.stock > 0).length;
        const outOfStockCount = lowStockItems.filter(p => p.stock <= 0).length;

        res.json({
            users: usersCount,
            products: productsCount,
            orders: ordersCount,
            revenue: totalRevenue,
            salesData,
            categoryData,
            recentOrders,
            growthPercent,
            lowStockCount,
            outOfStockCount,
            lowStockItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get low stock and out of stock inventory alerts
// @route   GET /api/admin/inventory/alerts
// @access  Private/Admin
const getInventoryAlerts = async (req, res) => {
    try {
        const lowStockProducts = await Product.find({ stock: { $gt: 0, $lte: 5 } }).sort({ stock: 1 });
        const outOfStockProducts = await Product.find({ stock: { $lte: 0 } }).sort({ name: 1 });

        res.json({
            lowStockProducts,
            outOfStockProducts,
            lowStockCount: lowStockProducts.length,
            outOfStockCount: outOfStockProducts.length,
            totalAlerts: lowStockProducts.length + outOfStockProducts.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching inventory alerts' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot delete admin user');
        }
        await User.findByIdAndDelete(req.params.id);

        await createAdminNotification({
            type: 'USER',
            message: `User removed: ${user.name} (${user.email})`,
            link: '/users',
            adminId: req.user._id
        });

        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Delete order
// @route   DELETE /api/admin/order/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        await Order.findByIdAndDelete(req.params.id);

        await createAdminNotification({
            type: 'ORDER',
            message: `Order removed by admin: ID ${req.params.id}`,
            link: '/orders',
            adminId: req.user._id
        });

        res.json({ message: 'Order removed' });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

module.exports = { 
    getUsers, 
    getAllOrders, 
    deleteProductAdmin, 
    updateOrderStatus, 
    getDashboardStats, 
    getInventoryAlerts,
    deleteUser, 
    deleteOrder 
};
