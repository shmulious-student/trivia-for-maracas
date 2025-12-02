import express from 'express';
import { GameResult } from '../models/GameResult';
import { authenticate as protect } from '../middleware/auth';

const router = express.Router();

// Get Leaderboard (Top 10)
router.get('/', async (req, res) => {
    try {
        const leaderboard = await GameResult.find()
            .sort({ score: -1, date: 1 })
            .limit(10);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Submit Score
router.post('/', protect, async (req: any, res) => {
    try {
        const { score } = req.body;

        if (typeof score !== 'number') {
            return res.status(400).json({ message: 'Invalid score' });
        }

        const gameResult = new GameResult({
            userId: req.user.id,
            username: req.user.username,
            score
        });

        await gameResult.save();
        res.status(201).json(gameResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
});

export default router;
