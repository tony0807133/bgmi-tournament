const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'BGMI Arena <noreply@morse-code-trainer.com>';

exports.sendRoomDetails = async ({ to, name, tournament, roomId, roomPassword, slotNumber }) => {
  await resend.emails.send({
    from: FROM, to,
    subject: `🎮 Room Details: ${tournament.title} — Match Starting Soon!`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{font-family:'Segoe UI',sans-serif;background:#0f0f1a;color:#fff;margin:0;padding:0}
.wrap{max-width:600px;margin:0 auto;background:#1a1a2e;border-radius:16px;overflow:hidden}
.hdr{background:linear-gradient(135deg,#f97316,#ef4444);padding:36px 30px;text-align:center}
.hdr h1{margin:0;font-size:26px;letter-spacing:2px}.hdr p{margin:8px 0 0;opacity:.9;font-size:14px}
.body{padding:30px}
.card{background:#16213e;border:1px solid #f97316;border-radius:12px;padding:20px;margin:16px 0}
.card h2{margin:0 0 14px;color:#f97316;font-size:14px;text-transform:uppercase}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2a2a4a}
.row:last-child{border-bottom:none}.lbl{color:#9ca3af;font-size:13px}.val{font-weight:bold;font-size:14px;color:#fff}
.rbox{background:#0f3460;border-radius:8px;padding:14px;text-align:center;margin:8px 0}
.rlbl{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px}
.rval{font-size:26px;font-weight:900;color:#f97316;letter-spacing:4px;margin-top:4px}
.warn{background:#1f1f0a;border:1px solid #f59e0b;border-radius:8px;padding:14px;margin:16px 0;color:#f59e0b;font-size:13px}
.ftr{background:#0f0f1a;padding:16px 30px;text-align:center;color:#6b7280;font-size:12px}
</style></head><body>
<div class="wrap">
<div class="hdr"><h1>🎮 BGMI Arena</h1><p>Room Details — Match Starting Soon!</p></div>
<div class="body">
<p>Hey <strong>${name}</strong>, your match is about to begin!</p>
<div class="card"><h2>🏆 Tournament Info</h2>
<div class="row"><span class="lbl">Tournament</span><span class="val">${tournament.title}</span></div>
<div class="row"><span class="lbl">Mode</span><span class="val">${tournament.type.toUpperCase()}</span></div>
<div class="row"><span class="lbl">Map</span><span class="val">${tournament.map}</span></div>
<div class="row"><span class="lbl">Your Slot</span><span class="val">#${slotNumber}</span></div>
<div class="row"><span class="lbl">Scheduled</span><span class="val">${new Date(tournament.scheduledAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',hour12:true})}</span></div>
</div>
<div class="card"><h2>🔑 Room Credentials</h2>
<div class="rbox"><div class="rlbl">Room ID</div><div class="rval">${roomId}</div></div>
<div class="rbox"><div class="rlbl">Room Password</div><div class="rval">${roomPassword}</div></div>
</div>
<div class="warn">⚠️ Join 10 minutes before match time. Do not share credentials.</div>
<p style="color:#9ca3af;font-size:13px">Good luck! 🔥</p>
</div>
<div class="ftr">BGMI Arena &bull; Automated email</div>
</div></body></html>`
  });
};

exports.sendRefundEmail = async ({ to, name, tournament, amount }) => {
  await resend.emails.send({
    from: FROM, to,
    subject: `💰 Refund: ₹${amount} credited — ${tournament.title}`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{font-family:'Segoe UI',sans-serif;background:#0f0f1a;color:#fff;margin:0;padding:0}
.wrap{max-width:600px;margin:0 auto;background:#1a1a2e;border-radius:16px;overflow:hidden}
.hdr{background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:30px;text-align:center}
.hdr h1{margin:0;font-size:22px}.body{padding:30px}
.amt{font-size:40px;font-weight:900;color:#22c55e;text-align:center;margin:20px 0}
.ftr{background:#0f0f1a;padding:16px;text-align:center;color:#6b7280;font-size:12px}
</style></head><body>
<div class="wrap">
<div class="hdr"><h1>💰 Refund Processed</h1></div>
<div class="body">
<p>Hey <strong>${name}</strong>,</p>
<p>Tournament <strong>${tournament.title}</strong> was cancelled. Your entry fee is refunded to your wallet.</p>
<div class="amt">₹${amount} Credited</div>
<p style="color:#9ca3af;font-size:13px">Available in your wallet now.</p>
</div>
<div class="ftr">BGMI Arena</div>
</div></body></html>`
  });
};

exports.sendReminderEmail = async ({ to, name, tournament, roomId, roomPassword, slotNumber }) => {
  await resend.emails.send({
    from: FROM, to,
    subject: `⚡ 15 Min Reminder: ${tournament.title} — Join Now!`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{font-family:'Segoe UI',sans-serif;background:#0f0f1a;color:#fff;margin:0;padding:0}
.wrap{max-width:600px;margin:0 auto;background:#1a1a2e;border-radius:16px;overflow:hidden}
.hdr{background:linear-gradient(135deg,#22c55e,#16a34a);padding:32px 30px;text-align:center}
.hdr h1{margin:0;font-size:22px}.hdr p{margin:6px 0 0;opacity:.9;font-size:14px}
.body{padding:30px}
.alert{background:#16213e;border:2px solid #22c55e;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px}
.cd{font-size:44px;font-weight:900;color:#22c55e}.sub{color:#9ca3af;font-size:13px;margin-top:4px}
.rbox{background:#0f3460;border-radius:8px;padding:14px;text-align:center;margin:8px 0}
.rlbl{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px}
.rval{font-size:26px;font-weight:900;color:#f97316;letter-spacing:4px;margin-top:4px}
.ftr{background:#0f0f1a;padding:16px 30px;text-align:center;color:#6b7280;font-size:12px}
</style></head><body>
<div class="wrap">
<div class="hdr"><h1>⚡ Match Starting in 15 Minutes!</h1><p>${tournament.title}</p></div>
<div class="body">
<p>Hey <strong>${name}</strong>, join the room NOW!</p>
<div class="alert"><div class="cd">15 min</div><div class="sub">until match start · Slot #${slotNumber}</div></div>
<div class="rbox"><div class="rlbl">Room ID</div><div class="rval">${roomId}</div></div>
<div class="rbox"><div class="rlbl">Room Password</div><div class="rval">${roomPassword}</div></div>
<p style="color:#f59e0b;font-size:13px;margin-top:16px">⚠️ Late entry = disqualification. Good luck! 🔥</p>
</div>
<div class="ftr">BGMI Arena &bull; Automated reminder</div>
</div></body></html>`
  });
};
