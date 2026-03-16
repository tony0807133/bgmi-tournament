const router = require('express').Router();
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');
const { protect, adminOnly } = require('../middleware/auth');

// Get wallet balance + transactions
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wallet upiId');
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ wallet: user.wallet, upiId: user.upiId, transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update UPI ID
router.put('/upi', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { upiId: req.body.upiId }, { new: true });
    res.json({ upiId: user.upiId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Request withdrawal
router.post('/withdraw', protect, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const upiId = String(req.body.upiId || '').trim();
    if (!amount || amount < 10) return res.status(400).json({ message: 'Minimum withdrawal is ₹10' });
    if (!upiId) return res.status(400).json({ message: 'UPI ID is required' });
    const user = await User.findById(req.user._id);
    if (user.wallet < amount) return res.status(400).json({ message: 'Insufficient balance' });

    // Deduct from wallet immediately (hold)
    await User.findByIdAndUpdate(req.user._id, { $inc: { wallet: -amount } });
    await Transaction.create({
      user: req.user._id,
      type: 'debit',
      amount,
      description: 'Withdrawal request',
      reference: upiId
    });
    const withdrawal = await Withdrawal.create({ user: req.user._id, amount, upiId });
    res.status(201).json(withdrawal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my withdrawals
router.get('/withdrawals', protect, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all pending withdrawals
router.get('/admin/withdrawals', protect, adminOnly, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Approve or reject withdrawal
router.put('/admin/withdrawals/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id).populate('user');
    if (!withdrawal) return res.status(404).json({ message: 'Not found' });

    // If rejected, refund to wallet
    if (status === 'rejected') {
      await User.findByIdAndUpdate(withdrawal.user._id, { $inc: { wallet: withdrawal.amount } });
      await Transaction.create({
        user: withdrawal.user._id,
        type: 'credit',
        amount: withdrawal.amount,
        description: 'Withdrawal rejected — refunded to wallet',
        reference: withdrawal._id.toString()
      });
    }
    withdrawal.status = status;
    withdrawal.adminNote = adminNote || '';
    withdrawal.processedAt = new Date();
    await withdrawal.save();
    res.json(withdrawal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add money to user wallet (manual)
router.post('/admin/add-funds', protect, adminOnly, async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    await User.findByIdAndUpdate(userId, { $inc: { wallet: amount } });
    await Transaction.create({ user: userId, type: 'credit', amount, description: description || 'Admin credit' });
    res.json({ message: 'Funds added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User: Create Razorpay order to deposit into wallet
router.post('/deposit/order', protect, async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const { amount } = req.body;
    if (!amount || amount < 10) return res.status(400).json({ message: 'Minimum deposit is ₹10' });
    const order = await razorpay.orders.create({
      amount: Math.round(amount) * 100,
      currency: 'INR',
      receipt: `dep_${Date.now()}`
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User: Verify deposit payment and credit wallet
router.post('/deposit/verify', protect, async (req, res) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount < 10 || parsedAmount > 100000)
      return res.status(400).json({ message: 'Invalid amount' });

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature)))
      return res.status(400).json({ message: 'Payment verification failed' });

    await User.findByIdAndUpdate(req.user._id, { $inc: { wallet: parsedAmount } });
    await Transaction.create({
      user: req.user._id,
      type: 'credit',
      amount: parsedAmount,
      description: 'Wallet deposit via Razorpay',
      reference: razorpay_payment_id
    });
    const user = await User.findById(req.user._id).select('wallet');
    res.json({ message: 'Wallet credited!', wallet: user.wallet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
