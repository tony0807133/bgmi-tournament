const router = require('express').Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Get my profile
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, bgmiId, bgmiName, upiId } = req.body;
    const updates = {
      name: name?.trim().slice(0, 50) || req.user.name,
      phone: phone?.trim().slice(0, 15) || '',
      bgmiId: bgmiId?.trim().slice(0, 20) || '',
      bgmiName: bgmiName?.trim().slice(0, 30) || '',
      upiId: upiId?.trim().slice(0, 50) || ''
    };
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all users
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
