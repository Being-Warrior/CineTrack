import db from '../config/db.js';
import { sendDailyEmail, sendWeeklyEmail } from './emailService.js';
import { sendDailyPush, sendWeeklyPush } from './fcmService.js';

// Fetch watching list for a user
const getWatchingList = async (user_id) => {
  const [rows] = await db.query(
    `SELECT uc.id, uc.content_id, c.title, c.poster_url, c.genre, c.release_year
     FROM user_content uc
     JOIN content c ON uc.content_id = c.content_id
     WHERE uc.user_id = ? AND uc.status = 'watching'`,
    [user_id]
  );
  return rows;
};

// Fetch watchlist for a user
const getWatchlist = async (user_id) => {
  const [rows] = await db.query(
    `SELECT uc.id, uc.content_id, c.title, c.poster_url, c.genre, c.release_year
     FROM user_content uc
     JOIN content c ON uc.content_id = c.content_id
     WHERE uc.user_id = ? AND uc.status = 'watchlist'`,
    [user_id]
  );
  return rows;
};

// Get all users
const getAllUsers = async () => {
  const [rows] = await db.query('SELECT user_id, username, email FROM users');
  return rows;
};

// ─── Run daily job (called by dailyJob.js) ────────────────────────────────────
export const runDailyNotifications = async () => {
  console.log('Running daily notifications...');
  const users = await getAllUsers();

  for (const user of users) {
    try {
      const watchingList = await getWatchingList(user.user_id);
      if (!watchingList.length) continue;

      // Send both email and push in parallel
      await Promise.all([
        sendDailyEmail(user, watchingList),
        sendDailyPush(user, watchingList),
      ]);
    } catch (err) {
      console.error(`Daily notification failed for user ${user.user_id}:`, err.message);
    }
  }

  console.log('Daily notifications done.');
};

// ─── Run weekly job (called by weeklyJob.js) ─────────────────────────────────
export const runWeeklyNotifications = async () => {
  console.log('Running weekly notifications...');
  const users = await getAllUsers();

  for (const user of users) {
    try {
      const watchlist = await getWatchlist(user.user_id);
      if (!watchlist.length) continue;

      await Promise.all([
        sendWeeklyEmail(user, watchlist),
        sendWeeklyPush(user, watchlist),
      ]);
    } catch (err) {
      console.error(`Weekly notification failed for user ${user.user_id}:`, err.message);
    }
  }

  console.log('Weekly notifications done.');
};
