const Notification = require('../models/Notification');

// @desc    Get all notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private/Admin
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      notification.isRead = true;
      await notification.save();
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete single notification
// @route   DELETE /api/admin/notifications/:id
// @access  Private/Admin
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      await Notification.findByIdAndDelete(req.params.id);
      res.json({ message: 'Notification removed' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/admin/notifications
// @access  Private/Admin
const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internal utility to create notifications
const createAdminNotification = async ({ type, message, link, adminId }) => {
  try {
    await Notification.create({
      type,
      message,
      link,
      admin: adminId,
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
  clearNotifications,
  createAdminNotification
};
