const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const defaultName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          otp,
          otpExpiry
        },
        $setOnInsert: {
          name: defaultName,
          role: 'user'
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
        role: user.role,
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
          role: user.role,
        },
      });
    } else if (user && user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied. Account is not registered as an administrator.' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
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

// @desc    Google OAuth Sign-In
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google Token payload missing email' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      if (!user.profilePic) user.profilePic = picture;
      await user.save();
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        avatar: picture,
        profilePic: picture,
        googleId,
        role: 'user',
      });
    }

    const sessionToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      token: sessionToken,
      role: user.role || 'user',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || user.profilePic,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    res.status(401).json({ message: 'Google Sign-In failed', error: error.message });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  adminLogin,
  updateAdminPassword,
  login,
  logout,
  googleAuth,
};

