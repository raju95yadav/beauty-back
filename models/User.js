const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    profilePic: {
      type: String,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Match user-entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
