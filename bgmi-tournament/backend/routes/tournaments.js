const router = require('express').Router();
const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, adminOnly } = require('../middleware/auth');
const { sendRoomDetails, sendRefundEmail } = require('../utils/email');
const upload = require('../middleware/upload');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all tournaments (public)
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    const tournaments = await Tournament.find(filter).sort({ scheduledAt: 1 });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single tournament
router.get('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const t = await Tournament.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Create tournament
router.post('/', protect, adminOnly, upload.single('banner'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.banner = req.file.path; // Cloudinary URL
    if (typeof data.prizes === 'string') data.prizes = JSON.parse(data.prizes);
    const tournament = await Tournament.create(data);
    res.status(201).json(tournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update tournament
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Send room details to all registered team leaders
router.post('/:id/send-room', protect, adminOnly, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    if (!tournament.roomId || !tournament.roomPassword)
      return res.status(400).json({ message: 'Set room ID and password first' });

    const registrations = await Registration.find({
      tournament: req.params.id,
      paymentStatus: 'paid'
    }).populate('teamLeader', 'name email');

    const emailPromises = registrations.map(reg =>
      sendRoomDetails({
        to: reg.teamLeader.email,
        name: reg.teamLeader.name,
        tournament,
        roomId: tournament.roomId,
        roomPassword: tournament.roomPassword,
        slotNumber: reg.slotNumber
      }).catch(err => console.error(`[Email] Failed to send to ${reg.teamLeader.email}:`, err.message))
    );
    await Promise.all(emailPromises);
    await Tournament.findByIdAndUpdate(req.params.id, { roomSent: true });
    res.json({ message: `Room details sent to ${registrations.length} teams` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Refund all if slots not full / cancel tournament
router.post('/:id/refund-all', protect, adminOnly, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Not found' });

    const registrations = await Registration.find({
      tournament: req.params.id,
      paymentStatus: 'paid'
    }).populate('teamLeader', 'name email');

    for (const reg of registrations) {
      await User.findByIdAndUpdate(reg.teamLeader._id, { $inc: { wallet: reg.amountPaid } });
      await Transaction.create({
        user: reg.teamLeader._id,
        type: 'credit',
        amount: reg.amountPaid,
        description: `Refund: ${tournament.title} cancelled`,
        reference: tournament._id.toString()
      });
      await Registration.findByIdAndUpdate(reg._id, { paymentStatus: 'refunded' });
      await sendRefundEmail({
        to: reg.teamLeader.email,
        name: reg.teamLeader.name,
        tournament,
        amount: reg.amountPaid
      }).catch(err => console.error(`[Email] Refund email failed for ${reg.teamLeader.email}:`, err.message));
    }
    await Tournament.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ message: `Refunded ${registrations.length} registrations` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Distribute prizes
router.post('/:id/distribute-prizes', protect, adminOnly, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const registrations = await Registration.find({
      tournament: req.params.id,
      paymentStatus: 'paid',
      prizeDistributed: false
    }).populate('teamLeader');

    if (registrations.length === 0) {
      return res.json({ message: 'All prizes already distributed (or no paid registrations)' });
    }

    // ── Recalculate actual prize pool based on paid registrations ────────────
    // Use actual paid count (not filledSlots) to avoid stale data issues
    // For paid tournaments: actual pool = entryFee × paidCount × 80%
    // For free/sponsored tournaments: use stored prizePool as-is
    const paidCount = await Registration.countDocuments({
      tournament: req.params.id,
      paymentStatus: 'paid'
    });
    const actualPrizePool = tournament.entryFee > 0
      ? Math.round(tournament.entryFee * paidCount * 0.8)
      : tournament.prizePool;

    // Scale each rank prize proportionally to actual pool vs max pool
    const maxPrizePool = tournament.prizePool; // stored max (based on totalSlots)
    const scaleFactor = maxPrizePool > 0 ? actualPrizePool / maxPrizePool : 1;

    let distributed = 0;
    for (const reg of registrations) {
      let prize = 0;

      const rankPrize = tournament.prizes.find(p => p.rank === reg.rank);
      if (rankPrize) {
        // Scale the rank prize to actual pool
        prize += Math.round(rankPrize.amount * scaleFactor);
      }

      // Kill prize — only for top 3, supports decimals
      if (tournament.killPrize && reg.kills > 0 && reg.rank >= 1 && reg.rank <= 3) {
        prize += Math.round(reg.kills * tournament.killPrize * 100) / 100;
      }

      if (prize > 0) {
        await User.findByIdAndUpdate(reg.teamLeader._id, {
          $inc: {
            wallet: prize,
            totalEarnings: prize,
            totalWins: reg.rank === 1 ? 1 : 0,
            totalKills: reg.kills || 0
          }
        });
        await Transaction.create({
          user: reg.teamLeader._id,
          type: 'credit',
          amount: prize,
          description: `Prize: ${tournament.title} — Rank #${reg.rank}, ${reg.kills} kills`,
          reference: tournament._id.toString()
        });
        distributed++;
      }
      await Registration.findByIdAndUpdate(reg._id, { prizeAwarded: prize, prizeDistributed: true });
    }
    await Tournament.findByIdAndUpdate(req.params.id, { status: 'completed' });
    res.json({ message: `Prizes distributed to ${distributed} winner(s) from ₹${actualPrizePool} pool` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Duplicate tournament
router.post('/:id/duplicate', protect, adminOnly, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const t = await Tournament.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    const { _id, filledSlots, roomId, roomPassword, roomSent, status, createdAt, ...data } = t.toObject();
    const copy = await Tournament.create({
      ...data,
      title: `${t.title} (Copy)`,
      filledSlots: 0,
      roomId: '',
      roomPassword: '',
      roomSent: false,
      status: 'upcoming',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // default +1 day
    });
    res.status(201).json(copy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: Leaderboard
router.get('/meta/leaderboard', async (req, res) => {
  try {
    const User = require('../models/User');
    const players = await User.find({ role: 'user', totalEarnings: { $gt: 0 } })
      .select('name bgmiName bgmiId totalWins totalKills totalEarnings')
      .sort({ totalEarnings: -1 })
      .limit(50);
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Analytics
router.get('/meta/analytics', protect, adminOnly, async (req, res) => {
  try {
    const [tournaments, registrations, transactions, users] = await Promise.all([
      Tournament.find(),
      Registration.find({ paymentStatus: 'paid' }),
      Transaction.find({ type: 'debit', description: { $regex: /^Entry:/ } }),
      require('../models/User').find({ role: 'user' })
    ]);

    const totalRevenue = transactions.reduce((a, t) => a + t.amount, 0);
    const totalPrizeDistributed = await Transaction.aggregate([
      { $match: { type: 'credit', description: { $regex: /^Prize:/ } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDeposits = await Transaction.aggregate([
      { $match: { type: 'credit', description: { $regex: /Wallet deposit/ } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Registrations per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyRegs = await Registration.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: 'paid' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalTournaments: tournaments.length,
      completedTournaments: tournaments.filter(t => t.status === 'completed').length,
      ongoingTournaments: tournaments.filter(t => t.status === 'ongoing').length,
      upcomingTournaments: tournaments.filter(t => t.status === 'upcoming').length,
      totalRegistrations: registrations.length,
      totalUsers: users.length,
      totalRevenue,
      adminProfit: Math.round(totalRevenue * 0.2),
      totalPrizeDistributed: totalPrizeDistributed[0]?.total || 0,
      totalDeposits: totalDeposits[0]?.total || 0,
      dailyRegistrations: dailyRegs,
      avgPlayersPerTournament: tournaments.length
        ? Math.round(registrations.length / tournaments.length)
        : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
