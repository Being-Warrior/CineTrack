import admin from 'firebase-admin';
import db from '../config/db.js';

// Initialize Firebase Admin SDK once — credentials from env variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace \n with actual newlines in the private key
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const messaging = admin.messaging();

// ─── Send push to a single user ───────────────────────────────────────────────
const sendPush = async (fcm_token, title, body, data = {}) => {
  try {
    await messaging.send({
      token: fcm_token,
      notification: { title, body },
      data, // extra payload for deep linking
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          requireInteraction: true,
        },
        fcmOptions: {
          link: data.url || `${process.env.APP_URL}/dashboard`,
        },
      },
    });
    return true;
  } catch (err) {
    // Token expired or invalid — remove from DB
    if (
      err.code === 'messaging/invalid-registration-token' ||
      err.code === 'messaging/registration-token-not-registered'
    ) {
      await db.query('DELETE FROM user_tokens WHERE fcm_token = ?', [fcm_token]);
      console.log('Removed invalid FCM token');
    } else {
      console.error('FCM send error:', err.message);
    }
    return false;
  }
};

// ─── Get all FCM tokens for a user ───────────────────────────────────────────
const getUserTokens = async (user_id) => {
  const [rows] = await db.query(
    'SELECT fcm_token FROM user_tokens WHERE user_id = ?',
    [user_id]
  );
  return rows.map((r) => r.fcm_token);
};

// ─── Daily push — watching list ───────────────────────────────────────────────
export const sendDailyPush = async (user, watchingList) => {
  if (!watchingList.length) return;

  const tokens = await getUserTokens(user.user_id);
  if (!tokens.length) return;

  const titleList = watchingList.map((i) => `• ${i.title}`).join('\n');
  const body = `You're watching ${watchingList.length} title${watchingList.length > 1 ? 's' : ''}:\n${titleList}\n\nAny updates?`;

  await Promise.all(
    tokens.map((token) =>
      sendPush(token, '🎬 CineTrack Daily Update', body, {
        url: `${process.env.APP_URL}/dashboard`,
        type: 'daily',
      })
    )
  );

  console.log(`Daily push sent to user ${user.user_id}`);
};

// ─── Weekly push — watchlist ──────────────────────────────────────────────────
export const sendWeeklyPush = async (user, watchlist) => {
  if (!watchlist.length) return;

  const tokens = await getUserTokens(user.user_id);
  if (!tokens.length) return;

  const titleList = watchlist.slice(0, 5).map((i) => `• ${i.title}`).join('\n');
  const more = watchlist.length > 5 ? `\n+ ${watchlist.length - 5} more...` : '';
  const body = `${watchlist.length} title${watchlist.length > 1 ? 's' : ''} waiting in your watchlist:\n${titleList}${more}`;

  await Promise.all(
    tokens.map((token) =>
      sendPush(token, '📋 Weekly Watchlist Reminder', body, {
        url: `${process.env.APP_URL}/dashboard`,
        type: 'weekly',
      })
    )
  );

  console.log(`Weekly push sent to user ${user.user_id}`);
};