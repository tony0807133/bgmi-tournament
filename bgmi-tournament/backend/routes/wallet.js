const router = require('express').Router();
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');
const { protect, adminOnly } = require('../middleware/auth');

const MAX_DEPOSIT = 50000;   // ₹50,000 per transaction
const MAX_WITHDRAW = 50000;
const UPI_REGEX = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;

// Get wallet balance + transactions
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

// Update UPI ID
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

// Request withdrawal
router.post('/withdraw', protect, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const upiId = String(req.body.upiId || '').trim();

    if (!Number.isInteger(amount) || amount < 10 || amount > MAX_WITHDRAW)
      return res.status(400).json({ message: `Withdrawal must be ₹10–₹${MAX_WITHDRAW}` });
    if (!upiId || !UPI_REGEX.test(upiId))
      return res.status(400).json({ message: 'Valid UPI ID is required' });

    // Atomic check-and-deduct to prevent race conditions
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, wallet: { $gte: amount } },
      { $inc: { wallet: -amount } },
      { new: true }
    );
    if (!user) return res.status(400).json({ message: 'Insufficient balance' });

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
    console.error('[Withdraw]', err.message);
    res.status(500).json({ message: 'Withdrawal failed' });
  }
});

// Get my withdrawals
router.get('/withdrawals', protect, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error('[Withdrawals]', err.message);
    res.status(500).json({ message: 'Failed to load withdrawals' });
  }
});

// Admin: Get all withdrawals
router.get('/admin/withdrawals', protect, adminOnly, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error('[AdminWithdrawals]', err.message);
    res.status(500).json({ message: 'Failed to load withdrawals' });
  }
});

// Admin: Approve or reject withdrawal
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
        user: withdrawal.user._id,
        type: 'credit',
        amount: withdrawal.amount,
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

// Admin: Add funds to user wallet
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
      user: userId,
      type: 'credit',
      amount: parsedAmount,
      description: String(description || 'Admin credit').slice(0, 100)
    });
    res.json({ message: 'Funds added' });
  } catch (err) {
    console.error('[AddFunds]', err.message);
    res.status(500).json({ message: 'Failed to add funds' });
  }
});

// User: Create Razorpay order for wallet deposit
router.post('/deposit/order', protect, async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const amount = Number(req.body.amount);
    if (!Number.isInteger(amount) || amount < 10 || amount > MAX_DEPOSIT)
      return res.status(400).json({ message: `Deposit must be ₹10–₹${MAX_DEPOSIT}` });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `dep_${Date.now()}`
    });
    res.json(order);
  } catch (err) {
    console.error('[DepositOrder]', err.message);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// User: Verify deposit and credit wallet (replay-attack protected)
router.post('/deposit/verify', protect, async (req, res) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount < 10 || parsedAmount > MAX_DEPOSIT)
      return res.status(400).json({ message: 'Invalid amount' });
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: 'Missing payment fields' });

    // Replay attack: check if this payment_id was already used
    const duplicate = await Transaction.findOne({ reference: razorpay_payment_id });
    if (duplicate) return res.status(400).json({ message: 'Payment already processed' });

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
    console.error('[DepositVerify]', err.message);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

module.exports = router;
