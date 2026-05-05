import { Router } from 'express';
import db from '../config/db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/notify/save-token — save FCM token from frontend
router.post('/save-token', authMiddleware, async (req, res) => {
  const { user_id } = req.user;
  const { fcm_token } = req.body;

  if (!fcm_token) return res.status(400).json({ message: 'fcm_token is required' });

  try {
    // Avoid duplicate tokens for same user
    const [existing] = await db.query(
      'SELECT id FROM user_tokens WHERE user_id = ? AND fcm_token = ?',
      [user_id, fcm_token]
    );

    if (!existing.length) {
      await db.query(
        'INSERT INTO user_tokens (user_id, fcm_token) VALUES (?, ?)',
        [user_id, fcm_token]
      );
    }

    res.json({ message: 'Token saved' });
  } catch (err) {
    console.error('save-token error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/notify/action?token=xxx — magic link handler from email buttons
router.get('/action', async (req, res) => {
  const { token } = req.query;

  if (!token) return res.status(400).send(renderPage('❌ Invalid Link', 'No token provided.', false));

  try {
    // Validate token
    const [rows] = await db.query(
      `SELECT * FROM notification_tokens
       WHERE token = ? AND used = FALSE AND expires_at > NOW()`,
      [token]
    );

    if (!rows.length) {
      return res.send(renderPage(
        '⚠️ Link Expired',
        'This link has already been used or has expired. Open the app to update your status.',
        false
      ));
    }

    const { id, user_id, content_id, action_status } = rows[0];

    // Update user_content status
    await db.query(
      `UPDATE user_content SET status = ? WHERE user_id = ? AND content_id = ?`,
      [action_status, user_id, content_id]
    );

    // Mark token as used
    await db.query('UPDATE notification_tokens SET used = TRUE WHERE id = ?', [id]);

    // Get title for confirmation message
    const [contentRows] = await db.query(
      'SELECT title FROM content WHERE content_id = ?',
      [content_id]
    );
    const title = contentRows[0]?.title || 'Title';

    const statusLabel = {
      completed: '✅ Completed',
      dropped:   '❌ Dropped',
      watching:  '▶️ Watching',
      watchlist: '📋 Added to Watchlist',
    }[action_status] || action_status;

    return res.send(renderPage(
      `${statusLabel}`,
      `"${title}" has been marked as <strong>${action_status}</strong> successfully!`,
      true
    ));

  } catch (err) {
    console.error('magic link error:', err.message);
    res.status(500).send(renderPage('❌ Error', 'Something went wrong. Please try again from the app.', false));
  }
});

// Simple HTML confirmation page
const renderPage = (heading, message, success) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CineTrack</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: Arial, sans-serif;
        background: #f9fafb;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 20px;
      }
      .card {
        background: white;
        border-radius: 16px;
        padding: 40px 32px;
        text-align: center;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      }
      .icon { font-size: 48px; margin-bottom: 16px; }
      h1 { font-size: 22px; margin-bottom: 12px; color: #111827; }
      p { font-size: 14px; color: #6b7280; line-height: 1.6; }
      .btn {
        display: inline-block;
        margin-top: 24px;
        background: #ff6b00;
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
      }
      .border { border-top: 4px solid ${success ? '#22c55e' : '#ef4444'}; }
    </style>
  </head>
  <body>
    <div class="card border">
      <div class="icon">${success ? '🎉' : '⚠️'}</div>
      <h1>${heading}</h1>
      <p>${message}</p>
      <a href="${process.env.APP_URL}/dashboard" class="btn">Open CineTrack →</a>
    </div>
  </body>
  </html>
`;

export default router;
