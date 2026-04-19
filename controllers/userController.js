const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { cloudinary } = require('../utils/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            username: user.username,
            profilePic: user.profilePic,
            address: user.address,
            phone: user.phone,
            addresses: user.addresses,
            wishlist: user.wishlist,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Check if email is already taken by another user
            if (req.body.email && req.body.email.toLowerCase() !== user.email.toLowerCase()) {
                const userExists = await User.findOne({ email: req.body.email.toLowerCase() });
                if (userExists) {
                    return res.status(400).json({ message: 'Email is already in use by another account' });
                }
            }

            // Check if username is already taken by another user
            if (req.body.username && req.body.username !== user.username) {
                const usernameExists = await User.findOne({ username: req.body.username });
                if (usernameExists) {
                    return res.status(400).json({ message: 'Username is already in use' });
                }
            }

            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.username = req.body.username || user.username;
            user.address = req.body.address || user.address;
            
            // Handle Profile Picture upload to Cloudinary
            if (req.file) {
                try {
                    const result = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { folder: 'profile_pics' },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        uploadStream.end(req.file.buffer);
                    });
                    user.profilePic = result.secure_url;
                } catch (error) {
                    console.error('Cloudinary Upload Error:', error);
                    return res.status(500).json({ message: 'Image upload failed' });
                }
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                username: updatedUser.username,
                profilePic: updatedUser.profilePic,
                address: updatedUser.address,
                phone: updatedUser.phone,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or Username already in use' });
        }
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
};
