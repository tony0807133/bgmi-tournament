const router = require('express').Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Get my profile
router.get('/me', protect, async (req, res) => {
  // req.user already has -password from auth middleware
  // Explicitly exclude sensitive internal fields
  const { password, googleId, __v, ...safe } = req.user.toObject();
  res.json(safe);
});

// Update profile
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, bgmiId, bgmiName, upiId } = req.body;
    if (phone && !/^\d{10}$/.test(phone.trim()))
      return res.status(400).json({ message: 'Phone must be 10 digits' });

    // BGMI ID must be unique — check no other user has it
    if (bgmiId?.trim()) {
      const taken = await User.findOne({ bgmiId: bgmiId.trim(), _id: { $ne: req.user._id } });
      if (taken) return res.status(400).json({ message: 'This BGMI ID is already linked to another account' });
    }
    const updates = {
      name: name?.trim().slice(0, 50) || req.user.name,
      phone: phone?.trim().slice(0, 15) || '',
      bgmiId: bgmiId?.trim().slice(0, 20) || '',
      bgmiName: bgmiName?.trim().slice(0, 30) || '',
      upiId: upiId?.trim().slice(0, 50) || ''
    };
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password -googleId -__v');
    res.json(user);
  } catch (err) {
    console.error('[UpdateProfile]', err.message);
    res.status(500).json({ message: 'Update failed' });
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

// Get referral info for current user
router.get('/referral', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode referralCount');
    res.json({ referralCode: user.referralCode, referralCount: user.referralCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
