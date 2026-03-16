const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ── Input validators ─────────────────────────────────────────────────────────
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isStrong = (v) => v && v.length >= 6;

// ── Google OAuth Strategy ────────────────────────────────────────────────────
const googleConfigured =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here';

if (googleConfigured) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('No email from Google'), null);
      let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value || '',
          isVerified: true
        });
      } else if (!user.googleId) {
        user.googleId = profile.id;
        user.avatar = user.avatar || profile.photos?.[0]?.value || '';
        await user.save();
      }
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
}

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); } catch (e) { done(e, null); }
});

// ── Register ─────────────────────────────────────────────────────────────────
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
      return res.status(400).json({ message: 'This account uses Google login' });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token: signToken(user._id), user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get('/google', (req, res, next) => {
  if (!googleConfigured) return res.status(503).json({ message: 'Google login not configured' });
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!googleConfigured)
    return res.redirect(`${CLIENT_URL}/login?error=google_not_configured`);

  passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/login?error=google` },
    (err, user) => {
      if (err || !user) return res.redirect(`${CLIENT_URL}/login?error=google`);
      const token = signToken(user._id);
      // Pass token via short-lived cookie instead of URL query param (avoids server logs exposure)
      res.cookie('auth_token', token, {
        httpOnly: false, // frontend JS needs to read it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 1000 // 1 minute — frontend reads and clears it
      });
      res.redirect(`${CLIENT_URL}/auth/callback`);
    }
  )(req, res, next);
});

module.exports = router;
