const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log('Admin user not found. Creating default admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created: admin@gmail.com / admin123');
    } else {
      console.log('Admin user exists:', admin.email);
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
        console.log('Updated user role to admin');
      }
    }

    mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmin();
