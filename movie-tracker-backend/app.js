import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import {
  runDailyNotifications,
  runWeeklyNotifications,
} from "./services/notificationService.js";

import dailyJob from "./jobs/dailyJob.js";
import weeklyJob from "./jobs/weeklyJob.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/test-daily", async (req, res) => {
  await runDailyNotifications();
  res.json({ message: "Daily notifications sent" });
});

app.get("/test-weekly", async (req, res) => {
  await runWeeklyNotifications();
  res.json({ message: "Weekly notifications sent" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/notify", notificationRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "CineTrack API running 🎬" }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Start cron jobs
dailyJob.start();
weeklyJob.start();
console.log("Cron jobs scheduled ✅");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
