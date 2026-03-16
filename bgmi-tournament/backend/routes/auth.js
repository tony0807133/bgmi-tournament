const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isStrong = (v) => v && v.length >= 6;

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, bgmiId, bgmiName, referralCode } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
    if (!isEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    if (!isStrong(password)) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: 'Email already exists' });

    // Validate referral code
    let referrer = null;
    if (referralCode?.trim()) {
      referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
    }

    const hashed = await bcrypt.hash(password, 12);
    const Transaction = require('../models/Transaction');
    const REFERRAL_BONUS = 20; // ₹20 bonus for both

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashed,
      phone: phone?.trim() || '',
      bgmiId: bgmiId?.trim() || '',
      bgmiName: bgmiName?.trim() || '',
      referredBy: referrer?._id || null
    });

    // Credit referral bonus to both
    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { wallet: REFERRAL_BONUS, referralCount: 1 }
      });
      await Transaction.create({
        user: referrer._id, type: 'credit', amount: REFERRAL_BONUS,
        description: `Referral bonus — ${user.name} joined using your code`
      });
      await User.findByIdAndUpdate(user._id, { $inc: { wallet: REFERRAL_BONUS } });
      await Transaction.create({
        user: user._id, type: 'credit', amount: REFERRAL_BONUS,
        description: `Welcome bonus — joined via referral code`
      });
    }

    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ token: signToken(user._id), user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email) || !password) return res.status(400).json({ message: 'Invalid credentials' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.password || user.password === '')
      return res.status(400).json({ message: 'This account uses Google login — please contact support' });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token: signToken(user._id), user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
