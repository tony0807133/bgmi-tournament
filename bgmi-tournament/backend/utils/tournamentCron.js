const cron = require('node-cron');
const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');
const { sendReminderEmail } = require('./email');

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

async function sendReminders() {
  const now = new Date();
  // Window: scheduledAt is between 14 and 16 minutes from now
  const in14 = new Date(now.getTime() + 14 * 60 * 1000);
  const in16 = new Date(now.getTime() + 16 * 60 * 1000);

  const upcoming = await Tournament.find({
    status: 'upcoming',
    roomSent: true, // only if room details have been sent
    scheduledAt: { $gte: in14, $lte: in16 },
    reminderSent: { $ne: true } // don't send twice
  });

  for (const tournament of upcoming) {
    if (!tournament.roomId || !tournament.roomPassword) continue;

    const registrations = await Registration.find({
      tournament: tournament._id,
      paymentStatus: 'paid'
    }).populate('teamLeader', 'name email');

    const emailPromises = registrations.map(reg =>
      sendReminderEmail({
        to: reg.teamLeader.email,
        name: reg.teamLeader.name,
        tournament,
        roomId: tournament.roomId,
        roomPassword: tournament.roomPassword,
        slotNumber: reg.slotNumber
      }).catch(err => console.error(`[Reminder] Failed for ${reg.teamLeader.email}:`, err.message))
    );

    await Promise.all(emailPromises);
    await Tournament.findByIdAndUpdate(tournament._id, { reminderSent: true });
    console.log(`[Reminder] Sent to ${registrations.length} players for: ${tournament.title}`);
  }
}

function startTournamentCron() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    await autoUpdateStatuses().catch(err => console.error('[Cron] Status error:', err.message));
    await sendReminders().catch(err => console.error('[Cron] Reminder error:', err.message));
  });
  console.log('[Cron] Tournament auto-status + reminder job started');
}

module.exports = { startTournamentCron };
