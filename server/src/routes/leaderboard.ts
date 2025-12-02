import express from 'express';
import { GameResult } from '../models/GameResult';
import { authenticate as protect } from '../middleware/auth';

const router = express.Router();

// Get Leaderboard (Top 10)
router.get('/', async (req, res) => {
    try {
        const results = await GameResult.find()
            .sort({ score: -1, date: 1 })
            .limit(20) // Fetch more than 10 to account for potential filtered items
            .populate('userId', 'avatarUrl')
            .populate('subjectId', 'name');

        const leaderboard = results
            .filter((result: any) => result.userId) // Filter out orphaned results
            .slice(0, 10) // Take top 10 after filtering
            .map((result: any) => ({
                id: result.id,
                userId: result.userId._id || result.userId,
                username: result.username,
                avatarUrl: result.userId.avatarUrl,
                score: result.score,
                subjectId: result.subjectId?._id,
                subjectName: result.subjectId?.name,
                date: result.date
            }));

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Submit Score
router.post('/', protect, async (req: any, res) => {
    try {
        const { score, subjectId } = req.body;

        if (typeof score !== 'number') {
            return res.status(400).json({ message: 'Invalid score' });
        }

        const gameResult = new GameResult({
            userId: req.user.id,
            username: req.user.username,
            score,
            subjectId
        });

        // Check for previous high score
        const previousBest = await GameResult.findOne({ userId: req.user.id })
            .sort({ score: -1 });

        const isNewRecord = !previousBest || score > previousBest.score;

        await gameResult.save();
        res.status(201).json({ ...gameResult.toJSON(), isNewRecord });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
});

export default router;
