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
    const orders = await Order.find({}).populate('user', 'id name');
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
            order.orderStatus = status;
            order.isDelivered = status === 'Delivered';
            
            if (status === 'Delivered') {
                order.deliveredAt = Date.now();
            } else if (status === 'Packed') {
                order.trackingData.packedAt = Date.now();
            } else if (status === 'Shipped') {
                order.trackingData.shippedAt = Date.now();
            } else if (status === 'Out for Delivery') {
                order.trackingData.outForDeliveryAt = Date.now();
            }
            
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

        // Mock data for charts if no real historical data exists
        const salesData = [
            { name: 'Jan', sales: 4000 },
            { name: 'Feb', sales: 3000 },
            { name: 'Mar', sales: 2000 },
            { name: 'Apr', sales: 2780 },
            { name: 'May', sales: 1890 },
            { name: 'Jun', sales: 2390 },
            { name: 'Jul', sales: 3490 },
        ];

        const categoryData = [
            { name: 'Makeup', value: 400 },
            { name: 'Skincare', value: 300 },
            { name: 'Haircare', value: 300 },
            { name: 'Fragrance', value: 200 },
        ];

        res.json({
            users: usersCount,
            products: productsCount,
            orders: ordersCount,
            revenue: totalRevenue,
            salesData,
            categoryData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

module.exports = { getUsers, getAllOrders, deleteProductAdmin, updateOrderStatus, getDashboardStats, deleteUser, deleteOrder };
