const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 10 },
  upiId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
