const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, adminOnly } = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const sanitizeMembers = (members) =>
  Array.isArray(members)
    ? members.slice(0, 3).map(m => ({
        bgmiId: String(m.bgmiId || '').trim().slice(0, 20),
        bgmiName: String(m.bgmiName || '').trim().slice(0, 30)
      }))
    : [];

// Collect all bgmiIds involved in a registration (leader + members)
const collectBgmiIds = (leaderBgmiId, members) => {
  const ids = [];
  if (leaderBgmiId) ids.push(leaderBgmiId.trim().toLowerCase());
  for (const m of members) {
    if (m.bgmiId) ids.push(m.bgmiId.trim().toLowerCase());
  }
  return ids.filter(Boolean);
};

// Check if any of the given bgmiIds are already registered in this tournament
// Checks both team leaders (via User lookup) and members array
const checkBgmiIdConflict = async (tournamentId, bgmiIds) => {
  if (!bgmiIds.length) return null;

  // Check if any bgmiId belongs to a team leader already registered
  const leaderUsers = await User.find({
    bgmiId: { $in: bgmiIds.map(id => new RegExp(`^${id}$`, 'i')) }
  }).select('_id bgmiId');

  if (leaderUsers.length) {
    const leaderIds = leaderUsers.map(u => u._id);
    const leaderReg = await Registration.findOne({
      tournament: tournamentId,
      teamLeader: { $in: leaderIds },
      paymentStatus: { $ne: 'refunded' }
    });
    if (leaderReg) {
      const conflictUser = leaderUsers.find(u => u._id.equals(leaderReg.teamLeader));
      return `BGMI ID ${conflictUser?.bgmiId} is already registered in this tournament`;
    }
  }

  // Check if any bgmiId appears in members of existing registrations
  const memberReg = await Registration.findOne({
    tournament: tournamentId,
    paymentStatus: { $ne: 'refunded' },
    'members.bgmiId': { $in: bgmiIds.map(id => new RegExp(`^${id}$`, 'i')) }
  });
  if (memberReg) {
    const conflictMember = memberReg.members.find(m =>
      bgmiIds.some(id => id.toLowerCase() === m.bgmiId?.toLowerCase())
    );
    return `BGMI ID ${conflictMember?.bgmiId} is already registered in this tournament`;
  }

  return null; // no conflict
};

// Register for tournament
router.post('/', protect, async (req, res) => {
  try {
    const { tournamentId, teamName, members, payWithWallet } = req.body;

    if (!isValidId(tournamentId)) return res.status(400).json({ message: 'Invalid tournament ID' });
    if (!teamName?.trim()) return res.status(400).json({ message: 'Team name is required' });

    const sanitizedTeamName = teamName.trim().slice(0, 30);
    const sanitizedMembers = sanitizeMembers(members);

    // Atomic slot claim: only increment if slots available
    const tournament = await Tournament.findOneAndUpdate(
      { _id: tournamentId, status: 'upcoming', $expr: { $lt: ['$filledSlots', '$totalSlots'] } },
      { $inc: { filledSlots: 1 } },
      { new: true }
    );
    if (!tournament) {
      // Check why it failed
      const t = await Tournament.findById(tournamentId);
      if (!t) return res.status(404).json({ message: 'Tournament not found' });
      if (t.status !== 'upcoming') return res.status(400).json({ message: 'Registration closed' });
      return res.status(400).json({ message: 'Tournament is full' });
    }

    // Check duplicate after slot claim (rollback if duplicate)
    const existing = await Registration.findOne({ tournament: tournamentId, teamLeader: req.user._id });
    if (existing) {
      await Tournament.findByIdAndUpdate(tournamentId, { $inc: { filledSlots: -1 } });
      return res.status(400).json({ message: 'Already registered' });
    }

    // Check BGMI ID uniqueness across the tournament (leader + all members)
    const bgmiIds = collectBgmiIds(req.user.bgmiId, sanitizedMembers);
    const conflict = await checkBgmiIdConflict(tournamentId, bgmiIds);
    if (conflict) {
      await Tournament.findByIdAndUpdate(tournamentId, { $inc: { filledSlots: -1 } });
      return res.status(400).json({ message: conflict });
    }

    const slotNumber = tournament.filledSlots; // already incremented

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
      return res.status(201).json({ registration: reg, free: true });
    }

    // Pay with wallet — atomic deduct
    if (payWithWallet) {
      const user = await User.findOneAndUpdate(
        { _id: req.user._id, wallet: { $gte: tournament.entryFee } },
        { $inc: { wallet: -tournament.entryFee } },
        { new: true }
      );
      if (!user) {
        await Tournament.findByIdAndUpdate(tournamentId, { $inc: { filledSlots: -1 } });
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }
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
      return res.status(201).json({ registration: reg, walletPaid: true });
    }

    // Razorpay order — rollback slot (slot confirmed only after payment verify)
    await Tournament.findByIdAndUpdate(tournamentId, { $inc: { filledSlots: -1 } });
    const order = await razorpay.orders.create({
      amount: tournament.entryFee * 100,
      currency: 'INR',
      receipt: `reg_${Date.now()}`
    });
    res.json({ order, tournamentId, teamName: sanitizedTeamName, members: sanitizedMembers });
  } catch (err) {
    console.error('[Register]', err.message);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Verify Razorpay payment and confirm registration
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tournamentId, teamName, members } = req.body;
    if (!isValidId(tournamentId)) return res.status(400).json({ message: 'Invalid tournament ID' });
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: 'Missing payment fields' });

    // Replay attack protection
    const duplicate = await Registration.findOne({ paymentId: razorpay_payment_id });
    if (duplicate) return res.status(400).json({ message: 'Payment already used' });

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature)))
      return res.status(400).json({ message: 'Payment verification failed' });

    // Prevent duplicate registration
    const existing = await Registration.findOne({ tournament: tournamentId, teamLeader: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already registered' });

    // Check BGMI ID uniqueness
    const sanitizedMembers = sanitizeMembers(members);
    const bgmiIds = collectBgmiIds(req.user.bgmiId, sanitizedMembers);
    const conflict = await checkBgmiIdConflict(tournamentId, bgmiIds);
    if (conflict) return res.status(400).json({ message: conflict });

    // Atomic slot claim
    const tournament = await Tournament.findOneAndUpdate(
      { _id: tournamentId, status: 'upcoming', $expr: { $lt: ['$filledSlots', '$totalSlots'] } },
      { $inc: { filledSlots: 1 } },
      { new: true }
    );
    if (!tournament) return res.status(400).json({ message: 'Tournament full or closed' });

    const sanitizedTeamName = String(teamName || '').trim().slice(0, 30);

    const reg = await Registration.create({
      tournament: tournamentId,
      teamLeader: req.user._id,
      teamName: sanitizedTeamName,
      members: sanitizedMembers,
      slotNumber: tournament.filledSlots,
      paymentId: razorpay_payment_id,
      paymentStatus: 'paid',
      amountPaid: tournament.entryFee
    });
    await Transaction.create({
      user: req.user._id,
      type: 'debit',
      amount: tournament.entryFee,
      description: `Entry: ${tournament.title}`,
      reference: razorpay_payment_id
    });
    res.status(201).json(reg);
  } catch (err) {
    console.error('[VerifyPayment]', err.message);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// Admin: Update kills and rank
router.put('/:id/result', protect, adminOnly, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const kills = Math.min(Math.max(0, parseInt(req.body.kills) || 0), 99);
    const rank  = Math.min(Math.max(0, parseInt(req.body.rank)  || 0), 100);
    const reg = await Registration.findByIdAndUpdate(req.params.id, { kills, rank }, { new: true });
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    res.json(reg);
  } catch (err) {
    console.error('[UpdateResult]', err.message);
    res.status(500).json({ message: 'Update failed' });
  }
});

// Check if current user is registered for a tournament
router.get('/check/:tournamentId', protect, async (req, res) => {
  try {
    if (!isValidId(req.params.tournamentId)) return res.status(400).json({ message: 'Invalid ID' });
    const reg = await Registration.findOne({ tournament: req.params.tournamentId, teamLeader: req.user._id });
    res.json({ registered: !!reg, registration: reg || null });
  } catch (err) {
    console.error('[CheckReg]', err.message);
    res.status(500).json({ message: 'Check failed' });
  }
});

// Get my registrations
router.get('/my', protect, async (req, res) => {
  try {
    const regs = await Registration.find({ teamLeader: req.user._id })
      .populate('tournament')
      .sort({ createdAt: -1 });
    res.json(regs);
  } catch (err) {
    console.error('[MyRegs]', err.message);
    res.status(500).json({ message: 'Failed to load registrations' });
  }
});

// Admin: Get all registrations for a tournament
router.get('/tournament/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const regs = await Registration.find({ tournament: req.params.id })
      .populate('teamLeader', 'name email bgmiName bgmiId');
    res.json(regs);
  } catch (err) {
    console.error('[TournamentRegs]', err.message);
    res.status(500).json({ message: 'Failed to load registrations' });
  }
});

module.exports = router;
