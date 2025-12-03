import path from 'path';

// Load env vars immediately
import './config/env'; // Must be first!

import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';

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
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // In development, allow any local network origin
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // In production, check against allowed list
        const clientUrlEnv = process.env.CLIENT_URL;
        let allowedOrigins: string[] = ['http://localhost:5173', 'http://localhost:5174', 'https://trivia-for-maracas.onrender.com'];

        if (clientUrlEnv) {
            if (clientUrlEnv.includes(',')) {
                allowedOrigins = allowedOrigins.concat(clientUrlEnv.split(',').map(url => url.trim()));
            } else {
                allowedOrigins.push(clientUrlEnv.trim());
            }
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: false, // Allow loading resources from other origins (e.g. Cloudinary)
    contentSecurityPolicy: false // Disable CSP for now to avoid breaking existing scripts/images if not carefully configured
}));
app.use(compression());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all requests
app.use(limiter);

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

// Serve client static files
app.use(express.static(path.join(__dirname, '../../client/dist'), {
    maxAge: '1d', // Cache for 1 day
    immutable: true // Assets with hashes are immutable
}));

// Handle SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Error Handling
app.use(errorHandler);

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
