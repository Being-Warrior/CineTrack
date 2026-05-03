import cron from 'node-cron';
import { runDailyNotifications } from '../services/notificationService.js';

// Runs every day at 8:00 PM
// Cron syntax: minute hour day month weekday
const dailyJob = cron.schedule('0 20 * * *', async () => {
  console.log(`[${new Date().toISOString()}] Daily job triggered`);
  await runDailyNotifications();
}, {
  timezone: 'Asia/Kolkata', // IST — change to your timezone
});

export default dailyJob;
