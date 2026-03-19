const cloudinary = require("cloudinary").v2;
const Deposit = require("../models/Deposit");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Extract Cloudinary public_id from a secure_url
// e.g. https://res.cloudinary.com/xxx/image/upload/v123/bgmi-deposits/abc.jpg -> bgmi-deposits/abc
function getPublicId(url) {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    // Remove version segment (v12345/) if present
    const path = parts[1].replace(/^v\d+\//, "");
    // Remove file extension
    return path.replace(/\.[^/.]+$/, "");
  } catch { return null; }
}

async function runCleanup() {
  const cutoff = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago

  // Find processed deposits older than 10 days that still have a screenshot
  const deposits = await Deposit.find({
    status: { $in: ["approved", "rejected"] },
    screenshotUrl: { $ne: "" },
    processedAt: { $lt: cutoff }
  });

  if (deposits.length === 0) {
    console.log("[Cleanup] No screenshots to delete");
    return;
  }

  console.log(`[Cleanup] Deleting ${deposits.length} old deposit screenshots...`);

  for (const deposit of deposits) {
    const publicId = getPublicId(deposit.screenshotUrl);
    if (!publicId) continue;
    try {
      await cloudinary.uploader.destroy(publicId);
      deposit.screenshotUrl = "";
      await deposit.save();
      console.log(`[Cleanup] Deleted: ${publicId}`);
    } catch (err) {
      console.error(`[Cleanup] Failed to delete ${publicId}:`, err.message);
    }
  }
}

function startCleanupJob() {
  console.log("[Cleanup] Screenshot auto-delete enabled — runs every 24h, deletes after 10 days");
  // Run once on startup (catches any missed deletions)
  runCleanup().catch(err => console.error("[Cleanup] Error:", err.message));
  // Then every 24 hours
  setInterval(() => {
    runCleanup().catch(err => console.error("[Cleanup] Error:", err.message));
  }, 24 * 60 * 60 * 1000);
}

module.exports = { startCleanupJob };
