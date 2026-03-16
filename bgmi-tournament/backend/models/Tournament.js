const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
  rank: Number,
  amount: Number,
  killPrize: { type: Number, default: 0 }
});

const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['solo', 'duo', 'squad'], required: true },
  entryFee: { type: Number, required: true, min: 0 },
  totalSlots: { type: Number, required: true },
  filledSlots: { type: Number, default: 0 },
  prizePool: { type: Number, default: 0 },
  adminProfit: { type: Number, default: 0 },
  prizes: [prizeSchema],
  killPrize: { type: Number, default: 0 },  // can be decimal e.g. 0.5
  map: { type: String, default: 'Erangel' },
  scheduledAt: { type: Date, required: true },
  roomId: { type: String, default: '' },
  roomPassword: { type: String, default: '' },
  roomSent: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isPaid: { type: Boolean, default: false },
  banner: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Recalculate prize pool only for paid tournaments (free = admin sets prizePool manually)
tournamentSchema.pre('save', function (next) {
  if (this.entryFee > 0) {
    const total = this.entryFee * this.totalSlots;
    this.adminProfit = Math.round(total * 0.2);
    this.prizePool = Math.round(total * 0.8);
  }
  next();
});

// Also recalculate on findOneAndUpdate (skip for free)
tournamentSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const fee = update.entryFee ?? update.$set?.entryFee;
  const slots = update.totalSlots ?? update.$set?.totalSlots;
  if (fee !== undefined && slots !== undefined && Number(fee) > 0) {
    const total = Number(fee) * Number(slots);
    this.set({ adminProfit: Math.round(total * 0.2), prizePool: Math.round(total * 0.8) });
  }
  next();
});

module.exports = mongoose.model('Tournament', tournamentSchema);
