import cron from 'node-cron';
import { runWeeklyNotifications } from '../services/notificationService.js';

// Runs every Sunday at 10:00 AM
// Cron syntax: minute hour day month weekday (0 = Sunday)
const weeklyJob = cron.schedule('0 10 * * 0', async () => {
  console.log(`[${new Date().toISOString()}] Weekly job triggered`);
  await runWeeklyNotifications();
}, {
  timezone: 'Asia/Kolkata', // IST — change to your timezone
});

export default weeklyJob;
