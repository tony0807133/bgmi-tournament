const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  bgmiId: String,
  bgmiName: String
});

const registrationSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamName: { type: String, required: true },
  members: [memberSchema],
  slotNumber: { type: Number },
  paymentId: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  amountPaid: { type: Number, default: 0 },
  kills: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  winningScreenshot: { type: String, default: '' },
  screenshotVerified: { type: Boolean, default: false },
  prizeAwarded: { type: Number, default: 0 },
  prizeDistributed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);
