const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../services/emailService');

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    console.log(`Generating OTP for ${email}...`);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    console.log(`Updating user in DB...`);
    // Find or create user and update OTP
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        $set: { 
          otp, 
          otpExpiry
        } 
      },
      { upsert: true, new: true }
    );

    console.log(`User DB update successful.`);

    const message = `Your Login OTP is ${otp}. It will expire in 5 minutes.`;
    
    // Log OTP to console for debugging/fallback
    console.log('------------------------------------');
    console.log(`LOGIN OTP for ${email}: ${otp}`);
    console.log('------------------------------------');

    try {
      await sendEmail({
        email,
        subject: 'Login OTP',
        message,
      });
    } catch (emailError) {
      console.error('Email sending failed, but OTP is logged to console:', emailError.message);
      return res.status(200).json({ 
        success: true, 
        message: 'OTP generated (Check server logs for code if email fails)' 
      });
    }

    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('CRITICAL Send OTP error:', error);
    res.status(500).json({ message: 'Error generating OTP', error: error.message });
  }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    // Set default role if not set
    if (!user.role) user.role = 'user';
    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// @desc    Admin Login (Email/Password)
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';

  if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(401).json({ message: 'Not authorized as admin' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && user.role === 'admin' && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        role: user.role,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

// @desc    Update Admin Password
// @route   PUT /api/auth/update-admin-password
// @access  Private (Admin)
const updateAdminPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide old and new passwords' });
  }

  try {
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(oldPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ success: true, message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid old password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during password update' });
  }
};

// @desc    Login user (Email/Password) - General (Keeping for fallback or other roles)
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          email: user.email,
          role: user.role || 'user',
          name: user.name,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Logout user
const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
  sendOTP,
  verifyOTP,
  adminLogin,
  updateAdminPassword,
  login,
  logout,
};
