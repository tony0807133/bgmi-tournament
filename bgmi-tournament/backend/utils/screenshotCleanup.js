const cron = require('node-cron');
const cloudinary = require('cloudinary').v2;
const Registration = require('../models/Registration');

// Extract Cloudinary public_id from a URL
// e.g. https://res.cloudinary.com/demo/image/upload/v123/bgmi/screenshots/abc.jpg → bgmi/screenshots/abc
function getPublicId(url) {
  if (!url) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    // Remove version segment (v12345/) if present
    const withoutVersion = parts[1].replace(/^v\d+\//, '');
    // Remove file extension
    return withoutVersion.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}

async function deleteOldScreenshots() {
  const cutoff = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
  const old = await Registration.find({
    winningScreenshot: { $ne: null, $exists: true },
    createdAt: { $lt: cutoff }
  });

  for (const reg of old) {
    const publicId = getPublicId(reg.winningScreenshot);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`[Cleanup] Deleted screenshot: ${publicId}`);
      } catch (err) {
        console.error(`[Cleanup] Failed to delete ${publicId}:`, err.message);
      }
    }
    reg.winningScreenshot = null;
    await reg.save();
  }
  if (old.length) console.log(`[Cleanup] Processed ${old.length} old screenshots`);
}

function startCleanupJob() {
  // Run daily at 2am
  cron.schedule('0 2 * * *', () => {
    console.log('[Cleanup] Running screenshot cleanup...');
    deleteOldScreenshots().catch(err => console.error('[Cleanup] Error:', err.message));
  });
  console.log('[Cleanup] Screenshot cleanup job scheduled');
}

module.exports = { startCleanupJob };
