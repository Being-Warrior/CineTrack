import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',    authRoutes);
app.use('/api/content', contentRoutes);

app.get('/', (req, res) => res.json({ message: 'CineTrack API running 🎬' }));
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
