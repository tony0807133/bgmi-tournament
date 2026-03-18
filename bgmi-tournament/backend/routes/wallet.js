const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');
const Deposit = require('../models/Deposit');
const { protect, adminOnly } = require('../middleware/auth');

const MAX_WITHDRAW = 50000;
const UPI_REGEX = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;

// Multer — memory storage for Cloudinary upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  }
});

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });

// ── Get wallet balance + transactions ─────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wallet upiId');
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ wallet: user.wallet, upiId: user.upiId, transactions });
  } catch (err) {
    console.error('[Wallet]', err.message);
    res.status(500).json({ message: 'Failed to load wallet' });
  }
});

// ── Update UPI ID ─────────────────────────────────────────────────────────────
router.put('/upi', protect, async (req, res) => {
  try {
    const upiId = String(req.body.upiId || '').trim().slice(0, 100);
    if (upiId && !UPI_REGEX.test(upiId))
      return res.status(400).json({ message: 'Invalid UPI ID format' });
    const user = await User.findByIdAndUpdate(req.user._id, { upiId }, { new: true });
    res.json({ upiId: user.upiId });
  } catch (err) {
    console.error('[UPI]', err.message);
    res.status(500).json({ message: 'Failed to update UPI' });
  }
});

// ── Submit deposit request (with screenshot) ──────────────────────────────────
router.post('/deposit', protect, upload.single('screenshot'), async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const utrNumber = String(req.body.utrNumber || '').trim().slice(0, 50);

    if (!Number.isInteger(amount) || amount < 10 || amount > 50000)
      return res.status(400).json({ message: 'Deposit must be ₹10–₹50,000' });
    if (!req.file) return res.status(400).json({ message: 'Payment screenshot is required' });

    const result = await uploadToCloudinary(req.file.buffer, 'bgmi-deposits');
    const deposit = await Deposit.create({
      user: req.user._id,
      amount,
      screenshotUrl: result.secure_url,
      utrNumber
    });
    res.status(201).json({ message: 'Deposit request submitted! Admin will verify shortly.', deposit });
  } catch (err) {
    console.error('[Deposit]', err.message);
    res.status(500).json({ message: 'Failed to submit deposit' });
  }
});

// ── Get my deposit requests ───────────────────────────────────────────────────
router.get('/deposits', protect, async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(deposits);
  } catch (err) {
    console.error('[MyDeposits]', err.message);
    res.status(500).json({ message: 'Failed to load deposits' });
  }
});

// ── Request withdrawal ────────────────────────────────────────────────────────
router.post('/withdraw', protect, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const upiId = String(req.body.upiId || '').trim();

    if (!Number.isInteger(amount) || amount < 10 || amount > MAX_WITHDRAW)
      return res.status(400).json({ message: `Withdrawal must be ₹10–₹${MAX_WITHDRAW}` });
    if (!upiId || !UPI_REGEX.test(upiId))
      return res.status(400).json({ message: 'Valid UPI ID is required' });

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, wallet: { $gte: amount } },
      { $inc: { wallet: -amount } },
      { new: true }
    );
    if (!user) return res.status(400).json({ message: 'Insufficient balance' });

    await Transaction.create({
      user: req.user._id, type: 'debit', amount,
      description: 'Withdrawal request', reference: upiId
    });
    const withdrawal = await Withdrawal.create({ user: req.user._id, amount, upiId });
    res.status(201).json(withdrawal);
  } catch (err) {
    console.error('[Withdraw]', err.message);
    res.status(500).json({ message: 'Withdrawal failed' });
  }
});

// ── Get my withdrawals ────────────────────────────────────────────────────────
router.get('/withdrawals', protect, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error('[Withdrawals]', err.message);
    res.status(500).json({ message: 'Failed to load withdrawals' });
  }
});

// ── Admin: Get all pending deposits ──────────────────────────────────────────
router.get('/admin/deposits', protect, adminOnly, async (req, res) => {
  try {
    const deposits = await Deposit.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(deposits);
  } catch (err) {
    console.error('[AdminDeposits]', err.message);
    res.status(500).json({ message: 'Failed to load deposits' });
  }
});

// ── Admin: Approve or reject deposit ─────────────────────────────────────────
router.put('/admin/deposits/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const deposit = await Deposit.findById(req.params.id).populate('user');
    if (!deposit) return res.status(404).json({ message: 'Not found' });
    if (deposit.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    if (status === 'approved') {
      await User.findByIdAndUpdate(deposit.user._id, { $inc: { wallet: deposit.amount } });
      await Transaction.create({
        user: deposit.user._id, type: 'credit', amount: deposit.amount,
        description: `Wallet deposit approved`, reference: deposit._id.toString()
      });
    }

    deposit.status = status;
    deposit.adminNote = String(adminNote || '').slice(0, 200);
    deposit.processedAt = new Date();
    await deposit.save();
    res.json(deposit);
  } catch (err) {
    console.error('[AdminDeposit]', err.message);
    res.status(500).json({ message: 'Action failed' });
  }
});

// ── Admin: Get all withdrawals ────────────────────────────────────────────────
router.get('/admin/withdrawals', protect, adminOnly, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error('[AdminWithdrawals]', err.message);
    res.status(500).json({ message: 'Failed to load withdrawals' });
  }
});

// ── Admin: Approve or reject withdrawal ──────────────────────────────────────
router.put('/admin/withdrawals/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const withdrawal = await Withdrawal.findById(req.params.id).populate('user');
    if (!withdrawal) return res.status(404).json({ message: 'Not found' });
    if (withdrawal.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    if (status === 'rejected') {
      await User.findByIdAndUpdate(withdrawal.user._id, { $inc: { wallet: withdrawal.amount } });
      await Transaction.create({
        user: withdrawal.user._id, type: 'credit', amount: withdrawal.amount,
        description: 'Withdrawal rejected — refunded to wallet',
        reference: withdrawal._id.toString()
      });
    }
    withdrawal.status = status;
    withdrawal.adminNote = String(adminNote || '').slice(0, 200);
    withdrawal.processedAt = new Date();
    await withdrawal.save();
    res.json(withdrawal);
  } catch (err) {
    console.error('[AdminWithdrawal]', err.message);
    res.status(500).json({ message: 'Action failed' });
  }
});

// ── Admin: Add funds manually ─────────────────────────────────────────────────
router.post('/admin/add-funds', protect, adminOnly, async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0 || parsedAmount > 100000)
      return res.status(400).json({ message: 'Amount must be ₹1–₹1,00,000' });
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndUpdate(userId, { $inc: { wallet: parsedAmount } });
    await Transaction.create({
      user: userId, type: 'credit', amount: parsedAmount,
      description: String(description || 'Admin credit').slice(0, 100)
    });
    res.json({ message: 'Funds added' });
  } catch (err) {
    console.error('[AddFunds]', err.message);
    res.status(500).json({ message: 'Failed to add funds' });
  }
});

module.exports = router;
