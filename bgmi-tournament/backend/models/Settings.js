const mongoose = require('mongoose');

// Singleton settings document — always upsert with key: 'global'
const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  upiId: { type: String, default: '' },
  upiName: { type: String, default: 'BGMI Arena' },
  upiQrUrl: { type: String, default: '' }, // optional custom QR image URL
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
