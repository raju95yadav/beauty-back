const express = require('express');
const { getUsers, getAllOrders, deleteProductAdmin, updateOrderStatus, getDashboardStats, deleteUser, deleteOrder } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const { 
  getNotifications, 
  markAsRead, 
  deleteNotification, 
  clearNotifications 
} = require('../controllers/notificationController');

const router = express.Router();

router.route('/stats').get(protect, admin, getDashboardStats);
router.route('/users').get(protect, admin, getUsers);
router.route('/orders').get(protect, admin, getAllOrders);
router.route('/product/:id').delete(protect, admin, deleteProductAdmin);
router.route('/order/:id/status').put(protect, admin, updateOrderStatus);
router.route('/user/:id').delete(protect, admin, deleteUser);
router.route('/order/:id').delete(protect, admin, deleteOrder);

// Notification Routes
router.route('/notifications')
  .get(protect, admin, getNotifications)
  .delete(protect, admin, clearNotifications);
router.route('/notifications/:id')
  .delete(protect, admin, deleteNotification);
router.route('/notifications/:id/read')
  .put(protect, admin, markAsRead);

module.exports = router;
