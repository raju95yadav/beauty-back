const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['PRODUCT', 'ORDER', 'USER', 'ADMIN', 'SYSTEM'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String, // Path for direct navigation e.g. /orders/
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1296000 // 15 days in seconds
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
