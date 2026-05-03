import nodemailer from 'nodemailer';
import db from '../config/db.js';
import crypto from 'crypto';

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Generate a one-time magic link token and save to DB
const generateMagicToken = async (user_id, content_id, action_status) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.query(
    `INSERT INTO notification_tokens (user_id, content_id, action_status, token, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, content_id, action_status, token, expires_at]
  );

  return token;
};

// Build magic link URL
const magicLink = (token) =>
  `${process.env.APP_URL}/api/notify/action?token=${token}`;

// ─── Send Daily Email (Watching list) ────────────────────────────────────────
export const sendDailyEmail = async (user, watchingList) => {
  if (!watchingList.length) return;

  // Generate tokens for each movie × each action
  const movieRows = await Promise.all(
    watchingList.map(async (item) => {
      const completedToken = await generateMagicToken(user.user_id, item.content_id, 'completed');
      const droppedToken   = await generateMagicToken(user.user_id, item.content_id, 'dropped');

      return `
        <tr>
          <td style="padding:12px 8px; border-bottom:1px solid #f0f0f0;">
            <div style="display:flex; align-items:center; gap:12px;">
              ${item.poster_url
                ? `<img src="${item.poster_url}" width="40" style="border-radius:6px; vertical-align:middle;" />`
                : `<div style="width:40px;height:56px;background:#e5e7eb;border-radius:6px;display:inline-block;"></div>`
              }
              <div>
                <strong style="font-size:14px;">${item.title}</strong>
                <div style="font-size:12px;color:#6b7280;">${item.release_year || ''} ${item.genre ? '· ' + item.genre : ''}</div>
              </div>
            </div>
          </td>
          <td style="padding:12px 8px; border-bottom:1px solid #f0f0f0; text-align:center;">
            <a href="${magicLink(completedToken)}"
               style="background:#22c55e;color:white;padding:6px 12px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600;margin-right:6px;">
              ✅ Completed
            </a>
            <a href="${magicLink(droppedToken)}"
               style="background:#ef4444;color:white;padding:6px 12px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600;">
              ❌ Dropped
            </a>
          </td>
        </tr>`;
    })
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:'DM Sans',Arial,sans-serif;background:#f9fafb;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#ff6b00,#e55a00);padding:24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🎬 CineTrack Daily Update</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">
            Hey ${user.username}, here's what you're currently watching
          </p>
        </div>

        <!-- Body -->
        <div style="padding:24px;">
          <p style="color:#374151;font-size:14px;margin-top:0;">
            You have <strong>${watchingList.length}</strong> title${watchingList.length > 1 ? 's' : ''} in your watching list.
            Any updates? Click the buttons to change status directly:
          </p>

          <table width="100%" style="border-collapse:collapse;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Title</th>
                <th style="padding:10px 8px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Update Status</th>
              </tr>
            </thead>
            <tbody>
              ${movieRows.join('')}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #f0f0f0;">
          <a href="${process.env.APP_URL}/dashboard"
             style="color:#ff6b00;font-size:13px;text-decoration:none;font-weight:600;">
            Open CineTrack Dashboard →
          </a>
          <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;">
            You're receiving this because you have an active CineTrack account.
          </p>
        </div>

      </div>
    </body>
    </html>`;

  await transporter.sendMail({
    from: `"CineTrack 🎬" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: `🎬 Daily Update — ${watchingList.length} title${watchingList.length > 1 ? 's' : ''} in progress`,
    html,
  });

  console.log(`Daily email sent to ${user.email}`);
};

// ─── Send Weekly Email (Watchlist) ───────────────────────────────────────────
export const sendWeeklyEmail = async (user, watchlist) => {
  if (!watchlist.length) return;

  const movieRows = await Promise.all(
    watchlist.map(async (item) => {
      const watchingToken   = await generateMagicToken(user.user_id, item.content_id, 'watching');
      const completedToken  = await generateMagicToken(user.user_id, item.content_id, 'completed');
      const droppedToken    = await generateMagicToken(user.user_id, item.content_id, 'dropped');

      return `
        <tr>
          <td style="padding:12px 8px; border-bottom:1px solid #f0f0f0;">
            <div style="display:flex;align-items:center;gap:12px;">
              ${item.poster_url
                ? `<img src="${item.poster_url}" width="40" style="border-radius:6px;vertical-align:middle;" />`
                : `<div style="width:40px;height:56px;background:#e5e7eb;border-radius:6px;display:inline-block;"></div>`
              }
              <div>
                <strong style="font-size:14px;">${item.title}</strong>
                <div style="font-size:12px;color:#6b7280;">${item.release_year || ''} ${item.genre ? '· ' + item.genre : ''}</div>
              </div>
            </div>
          </td>
          <td style="padding:12px 8px; border-bottom:1px solid #f0f0f0; text-align:center;">
            <a href="${magicLink(watchingToken)}"
               style="background:#f59e0b;color:white;padding:6px 10px;border-radius:8px;text-decoration:none;font-size:11px;font-weight:600;margin:2px;">
              ▶️ Started
            </a>
            <a href="${magicLink(completedToken)}"
               style="background:#22c55e;color:white;padding:6px 10px;border-radius:8px;text-decoration:none;font-size:11px;font-weight:600;margin:2px;">
              ✅ Watched
            </a>
            <a href="${magicLink(droppedToken)}"
               style="background:#ef4444;color:white;padding:6px 10px;border-radius:8px;text-decoration:none;font-size:11px;font-weight:600;margin:2px;">
              ❌ Remove
            </a>
          </td>
        </tr>`;
    })
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:'DM Sans',Arial,sans-serif;background:#f9fafb;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <div style="background:linear-gradient(135deg,#ff6b00,#e55a00);padding:24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">📋 Weekly Watchlist Reminder</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">
            Hey ${user.username}, these are waiting for you!
          </p>
        </div>

        <div style="padding:24px;">
          <p style="color:#374151;font-size:14px;margin-top:0;">
            You have <strong>${watchlist.length}</strong> title${watchlist.length > 1 ? 's' : ''} in your watchlist.
            Did you watch any of them this week?
          </p>

          <table width="100%" style="border-collapse:collapse;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Title</th>
                <th style="padding:10px 8px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;">Update Status</th>
              </tr>
            </thead>
            <tbody>${movieRows.join('')}</tbody>
          </table>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #f0f0f0;">
          <a href="${process.env.APP_URL}/dashboard"
             style="color:#ff6b00;font-size:13px;text-decoration:none;font-weight:600;">
            Open CineTrack Dashboard →
          </a>
          <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;">
            CineTrack Weekly Digest · Every Sunday
          </p>
        </div>

      </div>
    </body>
    </html>`;

  await transporter.sendMail({
    from: `"CineTrack 🎬" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: `📋 Weekly Reminder — ${watchlist.length} title${watchlist.length > 1 ? 's' : ''} in your watchlist`,
    html,
  });

  console.log(`Weekly email sent to ${user.email}`);
};
