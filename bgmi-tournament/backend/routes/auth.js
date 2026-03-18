const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/email');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isStrong = (v) => v && v.length >= 6;

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, bgmiId, bgmiName, referralCode } = req.body;

    // Input validation with length limits
    if (!name?.trim() || name.trim().length > 50)
      return res.status(400).json({ message: 'Name is required (max 50 chars)' });
    if (!isEmail(email) || email.length > 100)
      return res.status(400).json({ message: 'Invalid email' });
    if (!isStrong(password) || password.length > 128)
      return res.status(400).json({ message: 'Password must be 6–128 characters' });
    if (phone && !/^\d{10}$/.test(phone.trim()))
      return res.status(400).json({ message: 'Phone must be 10 digits' });
    if (bgmiId && bgmiId.trim().length > 20)
      return res.status(400).json({ message: 'BGMI ID too long' });
    if (bgmiName && bgmiName.trim().length > 30)
      return res.status(400).json({ message: 'BGMI Name too long' });

    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: 'Email already exists' });

    // BGMI ID must be unique across all accounts
    if (bgmiId?.trim()) {
      if (await User.findOne({ bgmiId: bgmiId.trim() }))
        return res.status(400).json({ message: 'This BGMI ID is already linked to another account' });
    }

    // Validate referral code
    let referrer = null;
    if (referralCode?.trim()) {
      referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
    }

    const hashed = await bcrypt.hash(password, 12);
    const Transaction = require('../models/Transaction');
    const REFERRAL_BONUS = 20;

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashed,
      phone: phone?.trim() || '',
      bgmiId: bgmiId?.trim() || '',
      bgmiName: bgmiName?.trim() || '',
      referredBy: referrer?._id || null
    });

    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { wallet: REFERRAL_BONUS, referralCount: 1 }
      });
      await Transaction.create({
        user: referrer._id, type: 'credit', amount: REFERRAL_BONUS,
        description: `Referral bonus — new user joined using your code`
      });
      await User.findByIdAndUpdate(user._id, { $inc: { wallet: REFERRAL_BONUS } });
      await Transaction.create({
        user: user._id, type: 'credit', amount: REFERRAL_BONUS,
        description: 'Welcome bonus — joined via referral code'
      });
    }

    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ token: signToken(user._id), user: userObj });
  } catch (err) {
    console.error('[Register]', err.message);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email) || !password || password.length > 128)
      return res.status(400).json({ message: 'Invalid credentials' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.password || user.password === '')
      return res.status(400).json({ message: 'Account has no password set — please contact support' });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token: signToken(user._id), user: userObj });
  } catch (err) {
    console.error('[Login]', err.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ── Forgot Password ───────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!isEmail(email)) return res.status(400).json({ message: 'Invalid email' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond OK to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('[ForgotPassword]', err.message);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// ── Reset Password ────────────────────────────────────────────────────────────
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!isStrong(password) || password.length > 128)
      return res.status(400).json({ message: 'Password must be 6–128 characters' });

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: new Date() }
    });
    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error('[ResetPassword]', err.message);
    res.status(500).json({ message: 'Password reset failed' });
  }
});

module.exports = router;
