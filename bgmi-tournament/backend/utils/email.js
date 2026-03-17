const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
});

// Verify connection on startup (non-fatal)
transporter.verify().then(() => {
  console.log('[Email] SMTP connection verified');
}).catch(err => {
  console.warn('[Email] SMTP connection failed — emails will not send:', err.message);
});

exports.sendRoomDetails = async ({ to, name, tournament, roomId, roomPassword, slotNumber }) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f1a; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #f97316, #ef4444); padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
    .body { padding: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .card { background: #16213e; border: 1px solid #f97316; border-radius: 12px; padding: 24px; margin: 20px 0; }
    .card h2 { margin: 0 0 16px; color: #f97316; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #2a2a4a; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #9ca3af; font-size: 14px; }
    .value { font-weight: bold; font-size: 16px; color: #fff; }
    .room-box { background: #0f3460; border-radius: 8px; padding: 16px; text-align: center; margin: 10px 0; }
    .room-box .room-label { font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
    .room-box .room-value { font-size: 28px; font-weight: bold; color: #f97316; letter-spacing: 4px; margin-top: 4px; }
    .warning { background: #1f1f0a; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .warning p { margin: 0; color: #f59e0b; font-size: 14px; }
    .footer { background: #0f0f1a; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
    .badge { display: inline-block; background: #f97316; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎮 BGMI Tournament</h1>
      <p>Room Details — Match Starting Soon!</p>
    </div>
    <div class="body">
      <p class="greeting">Hey <strong>${name}</strong>, your match is about to begin!</p>
      <div class="card">
        <h2>🏆 Tournament Info</h2>
        <div class="detail-row">
          <span class="label">Tournament</span>
          <span class="value">${tournament.title}</span>
        </div>
        <div class="detail-row">
          <span class="label">Mode</span>
          <span class="value">${tournament.type.toUpperCase()}</span>
        </div>
        <div class="detail-row">
          <span class="label">Map</span>
          <span class="value">${tournament.map}</span>
        </div>
        <div class="detail-row">
          <span class="label">Your Slot</span>
          <span class="value">#${slotNumber}</span>
        </div>
        <div class="detail-row">
          <span class="label">Scheduled</span>
          <span class="value">${new Date(tournament.scheduledAt).toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div class="card">
        <h2>🔑 Room Credentials</h2>
        <div class="room-box">
          <div class="room-label">Room ID</div>
          <div class="room-value">${roomId}</div>
        </div>
        <div class="room-box">
          <div class="room-label">Room Password</div>
          <div class="room-value">${roomPassword}</div>
        </div>
      </div>
      <div class="warning">
        <p>⚠️ <strong>Important:</strong> Join the room 10 minutes before match time. Do not share these credentials. Late entry may result in disqualification.</p>
      </div>
      <p style="color:#9ca3af; font-size:14px;">After the match, upload your result screenshot in the app to claim your prize. Good luck, soldier! 🔥</p>
    </div>
    <div class="footer">
      <p>BGMI Tournament Platform &bull; This is an automated email, do not reply.</p>
      <p style="margin-top:8px;"><span class="badge">GLHF</span></p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"BGMI Tournament" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎮 Room Details: ${tournament.title} — Match Starting Soon!`,
    html
  });
};

exports.sendRefundEmail = async ({ to, name, tournament, amount }) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f1a; color: #fff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .body { padding: 30px; }
    .amount { font-size: 36px; font-weight: bold; color: #22c55e; text-align: center; margin: 20px 0; }
    .footer { background: #0f0f1a; padding: 16px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>💰 Refund Processed</h1></div>
    <div class="body">
      <p>Hey <strong>${name}</strong>,</p>
      <p>The tournament <strong>${tournament.title}</strong> was cancelled due to insufficient registrations. Your entry fee has been refunded to your wallet.</p>
      <div class="amount">₹${amount} Credited</div>
      <p style="color:#9ca3af; font-size:14px;">The amount is now available in your wallet. You can use it for future tournaments or withdraw it anytime.</p>
    </div>
    <div class="footer">BGMI Tournament Platform</div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"BGMI Tournament" <${process.env.EMAIL_USER}>`,
    to,
    subject: `💰 Refund: ₹${amount} credited to your wallet — ${tournament.title}`,
    html
  });
};

exports.sendReminderEmail = async ({ to, name, tournament, roomId, roomPassword, slotNumber }) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f1a; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); padding: 36px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; letter-spacing: 1px; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 15px; }
    .body { padding: 30px; }
    .alert { background: #16213e; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
    .alert .countdown { font-size: 42px; font-weight: 900; color: #22c55e; }
    .alert .sub { color: #9ca3af; font-size: 14px; margin-top: 4px; }
    .room-box { background: #0f3460; border-radius: 8px; padding: 16px; text-align: center; margin: 10px 0; }
    .room-box .room-label { font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
    .room-box .room-value { font-size: 28px; font-weight: bold; color: #f97316; letter-spacing: 4px; margin-top: 4px; }
    .footer { background: #0f0f1a; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ Match Starting in 15 Minutes!</h1>
      <p>${tournament.title}</p>
    </div>
    <div class="body">
      <p>Hey <strong>${name}</strong>, your match is about to begin. Join the room NOW!</p>
      <div class="alert">
        <div class="countdown">15 min</div>
        <div class="sub">until match start · Slot #${slotNumber}</div>
      </div>
      <div class="room-box">
        <div class="room-label">Room ID</div>
        <div class="room-value">${roomId}</div>
      </div>
      <div class="room-box">
        <div class="room-label">Room Password</div>
        <div class="room-value">${roomPassword}</div>
      </div>
      <p style="color:#f59e0b; font-size:14px; margin-top:20px;">⚠️ Join immediately — late entry may result in disqualification. Good luck! 🔥</p>
    </div>
    <div class="footer">BGMI Tournament Platform &bull; Automated reminder</div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"BGMI Tournament" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⚡ 15 Min Reminder: ${tournament.title} — Join Now!`,
    html
  });
};
