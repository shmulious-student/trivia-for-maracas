import express from 'express';
import { Question } from '../models/Question';

const router = express.Router();

// Get Questions (optional filter by subjectId, limit)
router.get('/', async (req, res) => {
    try {
        const { subjectId, limit } = req.query;
        const query = subjectId ? { subjectId } : {};

        let questions;
        if (limit) {
            const limitNum = parseInt(limit as string);
            questions = await Question.aggregate([
                { $match: query },
                { $sample: { size: limitNum } }
            ]);
        } else {
            questions = await Question.find(query);
        }

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Create Question
router.post('/', async (req, res) => {
    try {
        const question = new Question(req.body);
        await question.save();
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Update Question
router.put('/:id', async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Delete Question
router.delete('/:id', async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json({ message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

export default router;
