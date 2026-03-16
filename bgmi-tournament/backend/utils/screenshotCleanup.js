const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const Registration = require('../models/Registration');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

async function cleanupOldScreenshots() {
  try {
    const cutoff = new Date(Date.now() - TEN_DAYS_MS);

    // Find registrations with screenshots uploaded more than 10 days ago
    const regs = await Registration.find({
      winningScreenshot: { $ne: '' },
      createdAt: { $lt: cutoff }
    });

    if (regs.length === 0) return;

    let deleted = 0;
    for (const reg of regs) {
      // Delete file from disk
      const filename = reg.winningScreenshot.replace('/uploads/', '');
      const filepath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      // Clear the field in DB
      reg.winningScreenshot = '';
      reg.screenshotVerified = false;
      await reg.save();
      deleted++;
    }

    console.log(`[Screenshot Cleanup] Deleted ${deleted} old screenshot(s)`);
  } catch (err) {
    console.error('[Screenshot Cleanup] Error:', err.message);
  }
}

// Run every day at 2:00 AM
function startCleanupJob() {
  cron.schedule('0 2 * * *', cleanupOldScreenshots);
  console.log('[Screenshot Cleanup] Scheduled — runs daily at 2:00 AM');
}

module.exports = { startCleanupJob, cleanupOldScreenshots };
