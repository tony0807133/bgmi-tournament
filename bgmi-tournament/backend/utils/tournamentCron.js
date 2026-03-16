const cron = require('node-cron');
const Tournament = require('../models/Tournament');

async function autoUpdateStatuses() {
  const now = new Date();

  // upcoming → ongoing: scheduledAt has passed
  const toOngoing = await Tournament.updateMany(
    { status: 'upcoming', scheduledAt: { $lte: now } },
    { $set: { status: 'ongoing' } }
  );

  // ongoing → completed: 3 hours after scheduledAt
  const threeHoursAgo = new Date(now - 3 * 60 * 60 * 1000);
  const toCompleted = await Tournament.updateMany(
    { status: 'ongoing', scheduledAt: { $lte: threeHoursAgo } },
    { $set: { status: 'completed' } }
  );

  if (toOngoing.modifiedCount || toCompleted.modifiedCount) {
    console.log(`[Cron] Status update: ${toOngoing.modifiedCount} → ongoing, ${toCompleted.modifiedCount} → completed`);
  }
}

function startTournamentCron() {
  // Run every minute
  cron.schedule('* * * * *', () => {
    autoUpdateStatuses().catch(err => console.error('[Cron] Error:', err.message));
  });
  console.log('[Cron] Tournament auto-status job started');
}

module.exports = { startTournamentCron };
