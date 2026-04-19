const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const resetAdmin = async () => {
  const newPassword = process.argv[2] || 'admin123';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';

  console.log(`Connecting to MongoDB...`);
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in .env file');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully.');

    console.log(`Searching for admin user with email: ${adminEmail}`);
    let admin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!admin) {
      console.log('Admin user not found. Creating a new one...');
      admin = new User({
        name: 'System Admin',
        email: adminEmail.toLowerCase(),
        password: newPassword,
        role: 'admin'
      });
    } else {
      console.log('Admin user found. Updating password and ensuring admin role...');
      admin.password = newPassword;
      admin.role = 'admin';
    }

    await admin.save();
    console.log('-------------------------------------------');
    console.log('SUCCESS: Admin credentials updated!');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${newPassword}`);
    console.log('-------------------------------------------');
    console.log('You can now log in with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('ERROR resetting admin:', error.message);
    process.exit(1);
  }
};

resetAdmin();
