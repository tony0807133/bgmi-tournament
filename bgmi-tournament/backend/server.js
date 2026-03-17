require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' } // allow /uploads images from frontend
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    // Google OAuth redirects have no origin — always allow
    if (!origin) return cb(null, true);
    // In dev: allow any local network IP
    if (process.env.NODE_ENV !== 'production') {
      if (/^http:\/\/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin))
        return cb(null, true);
    }
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Sanitize MongoDB query injection ($, .) ──────────────────────────────────
app.use(mongoSanitize());

// ── Static uploads ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rate limiters ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 100,
  message: { message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/users', require('./routes/users'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/test-email', async (req, res) => {
  try {
    const { sendRoomDetails } = require('./utils/email');
    await sendRoomDetails({
      to: process.env.BREVO_USER,
      name: 'Test',
      tournament: { title: 'Test', type: 'squad', map: 'Erangel', scheduledAt: new Date() },
      roomId: '123456', roomPassword: 'test123', slotNumber: 1
    });
    res.json({ ok: true, sentTo: process.env.BREVO_USER });
  } catch (err) {
    res.json({ ok: false, error: err.message, user: process.env.BREVO_USER, keySet: !!process.env.BREVO_SMTP_KEY });
  }
});
// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── DB + Start ───────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    require('./utils/screenshotCleanup').startCleanupJob();
    require('./utils/tournamentCron').startTournamentCron();
    app.listen(process.env.PORT || 5000, '0.0.0.0', () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('DB connection error:', err));
