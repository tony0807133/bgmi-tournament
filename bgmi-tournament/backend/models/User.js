const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: '' },       // empty for Google users
  phone: { type: String, default: '' },
  bgmiId: { type: String, default: '' },
  bgmiName: { type: String, default: '' },
  googleId: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  wallet: { type: Number, default: 0 },
  upiId: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
