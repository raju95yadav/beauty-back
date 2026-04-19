const express = require('express');
const {
    getUserProfile,
    updateUserProfile,
} = require('../controllers/userController');
const { getAddresses, addAddress, deleteAddress } = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('profilePic'), updateUserProfile);

router.route('/addresses').get(protect, getAddresses).post(protect, addAddress);
router.route('/addresses/:id').delete(protect, deleteAddress);

module.exports = router;
