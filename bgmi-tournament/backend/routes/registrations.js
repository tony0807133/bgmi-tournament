const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Register for tournament (create Razorpay order or deduct from wallet)
router.post('/', protect, async (req, res) => {
  try {
    const { tournamentId, teamName, members, payWithWallet } = req.body;

    if (!isValidId(tournamentId)) return res.status(400).json({ message: 'Invalid tournament ID' });
    if (!teamName?.trim()) return res.status(400).json({ message: 'Team name is required' });

    const sanitizedTeamName = teamName.trim().slice(0, 30);
    const sanitizedMembers = Array.isArray(members)
      ? members.slice(0, 3).map(m => ({
          bgmiId: String(m.bgmiId || '').trim().slice(0, 20),
          bgmiName: String(m.bgmiName || '').trim().slice(0, 30)
        }))
      : [];
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    if (tournament.filledSlots >= tournament.totalSlots)
      return res.status(400).json({ message: 'Tournament is full' });
    if (tournament.status !== 'upcoming')
      return res.status(400).json({ message: 'Registration closed' });

    const existing = await Registration.findOne({ tournament: tournamentId, teamLeader: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already registered' });

    const slotNumber = tournament.filledSlots + 1;

    // Free tournament
    if (tournament.entryFee === 0) {
      const reg = await Registration.create({
        tournament: tournamentId,
        teamLeader: req.user._id,
        teamName: sanitizedTeamName,
        members: sanitizedMembers,
        slotNumber,
        paymentStatus: 'paid',
        amountPaid: 0
      });
      await Tournament.findByIdAndUpdate(tournamentId, { $inc: { filledSlots: 1 } });
      return res.status(201).json({ registration: reg, free: true });
    }

    // Pay with wallet
    if (payWithWallet) {
      const user = await User.findById(req.user._id);
      if (user.wallet < tournament.entryFee)
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      await User.findByIdAndUpdate(req.user._id, { $inc: { wallet: -tournament.entryFee } });
      await Transaction.create({
        user: req.user._id,
        type: 'debit',
        amount: tournament.entryFee,
        description: `Entry: ${tournament.title}`,
        reference: tournamentId
      });
      const reg = await Registration.create({
        tournament: tournamentId,
        teamLeader: req.user._id,
        teamName: sanitizedTeamName,
        members: sanitizedMembers,
        slotNumber,
        paymentStatus: 'paid',
        amountPaid: tournament.entryFee
      });
      await Tournament.findByIdAndUpdate(tournamentId, { $inc: { filledSlots: 1 } });
      return res.status(201).json({ registration: reg, walletPaid: true });
    }

    // Razorpay order
    const order = await razorpay.orders.create({
      amount: tournament.entryFee * 100,
      currency: 'INR',
      receipt: `reg_${Date.now()}`
    });
    res.json({ order, tournamentId, teamName: sanitizedTeamName, members: sanitizedMembers, slotNumber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify Razorpay payment and confirm registration
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tournamentId, teamName, members } = req.body;
    if (!isValidId(tournamentId)) return res.status(400).json({ message: 'Invalid tournament ID' });

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature)))
      return res.status(400).json({ message: 'Payment verification failed' });

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    // Prevent duplicate registration on double-submit
    const existing = await Registration.findOne({ tournament: tournamentId, teamLeader: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already registered' });

    const sanitizedTeamName = String(teamName || '').trim().slice(0, 30);
    const sanitizedMembers = Array.isArray(members)
      ? members.slice(0, 3).map(m => ({
          bgmiId: String(m.bgmiId || '').trim().slice(0, 20),
          bgmiName: String(m.bgmiName || '').trim().slice(0, 30)
        }))
      : [];

    const slotNumber = tournament.filledSlots + 1;
    const reg = await Registration.create({
      tournament: tournamentId,
      teamLeader: req.user._id,
      teamName: sanitizedTeamName,
      members: sanitizedMembers,
      slotNumber,
      paymentId: razorpay_payment_id,
      paymentStatus: 'paid',
      amountPaid: tournament.entryFee
    });
    await Tournament.findByIdAndUpdate(tournamentId, { $inc: { filledSlots: 1 } });
    await Transaction.create({
      user: req.user._id,
      type: 'debit',
      amount: tournament.entryFee,
      description: `Entry: ${tournament.title}`,
      reference: razorpay_payment_id
    });
    res.status(201).json(reg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload winning screenshot (team leader only, tournament must be ongoing or completed)
router.post('/:id/screenshot', protect, upload.single('screenshot'), async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const reg = await Registration.findById(req.params.id).populate('tournament');
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    if (reg.teamLeader.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (!['ongoing', 'completed'].includes(reg.tournament?.status))
      return res.status(400).json({ message: 'Screenshots can only be uploaded after match starts' });
    reg.winningScreenshot = req.file.path; // Cloudinary URL
    reg.screenshotVerified = false; // reset verification on re-upload
    await reg.save();
    res.json({ screenshot: reg.winningScreenshot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Verify or reject screenshot
router.put('/:id/verify-screenshot', protect, adminOnly, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const { verified } = req.body;
    const reg = await Registration.findByIdAndUpdate(
      req.params.id,
      { screenshotVerified: verified },
      { new: true }
    );
    res.json(reg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update kills and rank
router.put('/:id/result', protect, adminOnly, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const kills = Math.max(0, parseInt(req.body.kills) || 0);
    const rank  = Math.max(0, parseInt(req.body.rank)  || 0);
    const reg = await Registration.findByIdAndUpdate(req.params.id, { kills, rank }, { new: true });
    res.json(reg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if current user is registered for a tournament
router.get('/check/:tournamentId', protect, async (req, res) => {
  try {
    if (!isValidId(req.params.tournamentId)) return res.status(400).json({ message: 'Invalid ID' });
    const reg = await Registration.findOne({ tournament: req.params.tournamentId, teamLeader: req.user._id });
    res.json({ registered: !!reg, registration: reg || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my registrations
router.get('/my', protect, async (req, res) => {
  try {
    const regs = await Registration.find({ teamLeader: req.user._id }).populate('tournament');
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all registrations for a tournament
router.get('/tournament/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const regs = await Registration.find({ tournament: req.params.id }).populate('teamLeader', 'name email bgmiName bgmiId');
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
