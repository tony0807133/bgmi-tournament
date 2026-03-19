const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'BGMI Arena <noreply@morse-code-trainer.com>';

// ── Shared base template ──────────────────────────────────────────────────────
const base = (headerColor, headerIcon, headerTitle, headerSub, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${headerTitle}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a14;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a14;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:580px;background:#12121f;border-radius:20px;overflow:hidden;border:1px solid #1e1e35;">

      <!-- HEADER -->
      <tr><td style="background:${headerColor};padding:36px 32px;text-align:center;">
        <div style="font-size:40px;margin-bottom:10px;">${headerIcon}</div>
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:900;letter-spacing:1px;">${headerTitle}</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${headerSub}</p>
      </td></tr>

      <!-- BODY -->
      <tr><td style="padding:32px;">
        ${body}
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="background:#0a0a14;padding:20px 32px;text-align:center;border-top:1px solid #1e1e35;">
        <p style="margin:0;color:#4b5563;font-size:12px;">BGMI Arena &bull; <a href="https://bgmiarena.netlify.app" style="color:#f97316;text-decoration:none;">bgmiarena.netlify.app</a></p>
        <p style="margin:6px 0 0;color:#374151;font-size:11px;">Questions? Email <a href="mailto:spalande092@gmail.com" style="color:#6b7280;text-decoration:none;">spalande092@gmail.com</a></p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

// ── Credential box (Room ID / Password) ──────────────────────────────────────
const credBox = (label, value) => `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0;">
  <tr>
    <td style="background:#0d0d1f;border:1px solid #2a2a4a;border-radius:12px;padding:16px 20px;">
      <p style="margin:0 0 6px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">${label}</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:middle;">
            <span style="font-size:28px;font-weight:900;color:#f97316;letter-spacing:6px;font-family:'Courier New',monospace;">${value}</span>
          </td>
          <td align="right" style="vertical-align:middle;">
            <span style="background:#1e1e35;border:1px solid #2a2a4a;border-radius:8px;padding:6px 14px;color:#9ca3af;font-size:12px;font-weight:600;white-space:nowrap;">📋 Copy</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

// ── Info row ──────────────────────────────────────────────────────────────────
const infoRow = (label, value) => `
<tr>
  <td style="padding:10px 0;border-bottom:1px solid #1e1e35;color:#9ca3af;font-size:13px;">${label}</td>
  <td style="padding:10px 0;border-bottom:1px solid #1e1e35;color:#fff;font-size:13px;font-weight:700;text-align:right;">${value}</td>
</tr>`;

// ── sendRoomDetails ───────────────────────────────────────────────────────────
exports.sendRoomDetails = async ({ to, name, tournament, roomId, roomPassword, slotNumber }) => {
  const body = `
    <p style="color:#d1d5db;font-size:15px;margin:0 0 24px;">Hey <strong style="color:#fff;">${name}</strong>, your match is about to begin! Here are your room credentials.</p>

    <!-- Tournament Info -->
    <div style="background:#0d0d1f;border:1px solid #1e1e35;border-radius:14px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 14px;color:#f97316;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">🏆 Tournament Info</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow('Tournament', tournament.title)}
        ${infoRow('Mode', tournament.type.toUpperCase())}
        ${infoRow('Map', tournament.map)}
        ${infoRow('Your Slot', `#${slotNumber}`)}
        ${infoRow('Scheduled', new Date(tournament.scheduledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }))}
      </table>
    </div>

    <!-- Room Credentials -->
    <div style="background:#0d0d1f;border:2px solid #f97316;border-radius:14px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 14px;color:#f97316;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">🔑 Room Credentials</p>
      ${credBox('Room ID', roomId)}
      ${credBox('Room Password', roomPassword)}
      <p style="margin:14px 0 0;color:#6b7280;font-size:12px;text-align:center;">Tap and hold the value to copy on mobile</p>
    </div>

    <!-- Warning -->
    <div style="background:#1a1500;border:1px solid #f59e0b;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="margin:0;color:#f59e0b;font-size:13px;">⚠️ Join the room <strong>10 minutes before</strong> match time. Do not share these credentials with anyone.</p>
    </div>

    <p style="color:#6b7280;font-size:13px;margin:0;">Good luck and play fair! 🔥</p>`;

  await resend.emails.send({
    from: FROM, to,
    subject: `🎮 Room Details: ${tournament.title} — Match Starting Soon!`,
    html: base('linear-gradient(135deg,#f97316 0%,#ef4444 100%)', '🎮', 'Room Details Ready', 'Match Starting Soon — Join Now!', body)
  });
};

// ── sendReminderEmail ─────────────────────────────────────────────────────────
exports.sendReminderEmail = async ({ to, name, tournament, roomId, roomPassword, slotNumber }) => {
  const body = `
    <p style="color:#d1d5db;font-size:15px;margin:0 0 20px;">Hey <strong style="color:#fff;">${name}</strong>, your match starts in <strong style="color:#22c55e;">15 minutes</strong>! Join the room NOW.</p>

    <!-- Countdown -->
    <div style="background:#0d1f0d;border:2px solid #22c55e;border-radius:14px;padding:24px;text-align:center;margin-bottom:20px;">
      <div style="font-size:56px;font-weight:900;color:#22c55e;line-height:1;">15</div>
      <div style="color:#86efac;font-size:14px;margin-top:4px;">minutes until match start &bull; Slot #${slotNumber}</div>
    </div>

    <!-- Room Credentials -->
    <div style="background:#0d0d1f;border:2px solid #f97316;border-radius:14px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 14px;color:#f97316;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">🔑 Room Credentials</p>
      ${credBox('Room ID', roomId)}
      ${credBox('Room Password', roomPassword)}
      <p style="margin:14px 0 0;color:#6b7280;font-size:12px;text-align:center;">Tap and hold the value to copy on mobile</p>
    </div>

    <div style="background:#1a1500;border:1px solid #f59e0b;border-radius:10px;padding:14px 18px;">
      <p style="margin:0;color:#f59e0b;font-size:13px;">⚠️ Late entry = disqualification. Good luck! 🔥</p>
    </div>`;

  await resend.emails.send({
    from: FROM, to,
    subject: `⚡ 15 Min Reminder: ${tournament.title} — Join Now!`,
    html: base('linear-gradient(135deg,#22c55e 0%,#16a34a 100%)', '⚡', '15 Minutes to Match!', tournament.title, body)
  });
};

// ── sendRefundEmail ───────────────────────────────────────────────────────────
exports.sendRefundEmail = async ({ to, name, tournament, amount }) => {
  const body = `
    <p style="color:#d1d5db;font-size:15px;margin:0 0 24px;">Hey <strong style="color:#fff;">${name}</strong>,</p>
    <p style="color:#d1d5db;font-size:14px;margin:0 0 24px;">Tournament <strong style="color:#fff;">${tournament.title}</strong> was cancelled. Your entry fee has been refunded to your wallet.</p>

    <div style="background:#0d1f0d;border:1px solid #22c55e;border-radius:14px;padding:28px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 6px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Amount Refunded</p>
      <div style="font-size:48px;font-weight:900;color:#22c55e;">&#8377;${amount}</div>
      <p style="margin:8px 0 0;color:#86efac;font-size:13px;">Credited to your BGMI Arena wallet</p>
    </div>

    <p style="color:#6b7280;font-size:13px;margin:0;">Your balance is available immediately. <a href="https://bgmiarena.netlify.app/wallet" style="color:#f97316;text-decoration:none;">View Wallet →</a></p>`;

  await resend.emails.send({
    from: FROM, to,
    subject: `💰 Refund: ₹${amount} credited — ${tournament.title}`,
    html: base('linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%)', '💰', 'Refund Processed', `₹${amount} has been credited to your wallet`, body)
  });
};

// ── sendPasswordResetEmail ────────────────────────────────────────────────────
exports.sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const body = `
    <p style="color:#d1d5db;font-size:15px;margin:0 0 16px;">Hey <strong style="color:#fff;">${name}</strong>,</p>
    <p style="color:#d1d5db;font-size:14px;margin:0 0 28px;">We received a request to reset your BGMI Arena password. Click the button below to set a new one:</p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:900;font-size:16px;letter-spacing:0.5px;">Reset My Password</a>
    </div>

    <div style="background:#1a1500;border:1px solid #f59e0b;border-radius:10px;padding:14px 18px;margin:24px 0;">
      <p style="margin:0;color:#f59e0b;font-size:13px;">⚠️ This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email — your account is safe.</p>
    </div>

    <p style="color:#6b7280;font-size:12px;margin:0;word-break:break-all;">Or copy this link:<br/><span style="color:#f97316;">${resetUrl}</span></p>`;

  await resend.emails.send({
    from: FROM, to,
    subject: '🔐 Reset Your BGMI Arena Password',
    html: base('linear-gradient(135deg,#f97316 0%,#ef4444 100%)', '🔐', 'Password Reset', 'BGMI Arena Account Recovery', body)
  });
};
