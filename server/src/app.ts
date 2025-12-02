import dotenv from 'dotenv';
import path from 'path';

// Load env vars immediately
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import { connectDB } from './db';

import configRoutes from './routes/config';
import subjectRoutes from './routes/subjects';
import questionRoutes from './routes/questions';
import authRoutes from './routes/auth';
import translationRoutes from './routes/translation';
import uiTranslationRoutes from './routes/ui-translations';
import userRoutes from './routes/users';
import leaderboardRoutes from './routes/leaderboard';
import reportsRoutes from './routes/reports';
import { errorHandler } from './middleware/error';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database Connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/ui-translations', uiTranslationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/reports', reportsRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
