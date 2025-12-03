import express from 'express';
import { GameResult } from '../models/GameResult';
import { authenticate as protect } from '../middleware/auth';

const router = express.Router();

import { LeaderboardService } from '../services/leaderboard.service';

// Get Leaderboard (Top 10)
router.get('/', async (req, res) => {
    try {
        const { subjectId } = req.query;
        const leaderboard = await LeaderboardService.getTopScores(subjectId as string);
        res.json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Submit Score
router.post('/', protect, async (req: any, res) => {
    try {
        const { score, subjectId, gameId } = req.body;

        if (typeof score !== 'number') {
            return res.status(400).json({ message: 'Invalid score' });
        }

        if (!gameId) {
            return res.status(400).json({ message: 'Missing gameId' });
        }

        // Check for existing result with same gameId (Idempotency)
        const existingResult = await GameResult.findOne({ gameId });
        if (existingResult) {
            // Return existing result without error, treating it as a success
            // We need to re-calculate isNewRecord relative to when it was inserted, 
            // but for simplicity and to avoid confusion, we can just return it.
            // However, the client expects { ...result, isNewRecord }.
            // Let's check if it was a new record at the time? 
            // Or just calculate it now.
            const previousBest = await GameResult.findOne({
                userId: req.user.id,
                score: { $gt: existingResult.score }
            });
            const isNewRecord = !previousBest; // Approximate, but safe for idempotent retry
            return res.status(200).json({ ...existingResult.toJSON(), isNewRecord });
        }

        const gameResult = new GameResult({
            userId: req.user.id,
            username: req.user.username,
            score,
            subjectId,
            gameId
        });

        // Check for previous high score
        const previousBest = await GameResult.findOne({ userId: req.user.id })
            .sort({ score: -1 });

        const isNewRecord = !previousBest || score > previousBest.score;

        await gameResult.save();
        res.status(201).json({ ...gameResult.toJSON(), isNewRecord });
    } catch (error: any) {
        // Handle duplicate key error specifically if race condition occurs
        if (error.code === 11000 && error.keyPattern?.gameId) {
            const existingResult = await GameResult.findOne({ gameId: req.body.gameId });
            if (existingResult) {
                return res.status(200).json({ ...existingResult.toJSON(), isNewRecord: false });
            }
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
});

export default router;
