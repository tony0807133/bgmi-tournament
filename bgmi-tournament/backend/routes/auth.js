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
    const { name, email, password, phone, bgmiId, bgmiName } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
    if (!isEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    if (!isStrong(password)) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashed,
      phone: phone?.trim() || '',
      bgmiId: bgmiId?.trim() || '',
      bgmiName: bgmiName?.trim() || ''
    });
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
