import express from 'express';
import { Question } from '../models/Question';
import mongoose from 'mongoose';

const router = express.Router();

// Get Questions (optional filter by subjectId, limit)
router.get('/', async (req, res) => {
    try {
        const { subjectId, limit } = req.query;
        let questions: any[] = [];
        const limitNum = limit ? parseInt(limit as string) : 10;

        if (subjectId && (subjectId as string).includes(',')) {
            // Handle multiple subjects (Favorite Mix)
            const subjectIds = (subjectId as string).split(',');
            const questionsPerSubject = Math.ceil(limitNum / subjectIds.length);

            const promises = subjectIds.map(id =>
                Question.aggregate([
                    { $match: { subjectId: new mongoose.Types.ObjectId(id) } },
                    { $sample: { size: questionsPerSubject } }
                ])
            );

            const results = await Promise.all(promises);
            questions = results.flat();

            // Shuffle the mixed questions
            questions = questions.sort(() => Math.random() - 0.5);

            // Trim to exact limit if we got slightly more due to rounding
            if (questions.length > limitNum) {
                questions = questions.slice(0, limitNum);
            }

            // Transform aggregate results
            questions = questions.map(q => {
                const { _id, __v, ...rest } = q;
                return { ...rest, id: _id };
            });

        } else {
            // Handle single subject or no subject
            const query = subjectId ? { subjectId: new mongoose.Types.ObjectId(subjectId as string) } : {};

            if (limit) {
                questions = await Question.aggregate([
                    { $match: query },
                    { $sample: { size: limitNum } }
                ]);

                // Transform aggregate results
                questions = questions.map(q => {
                    const { _id, __v, ...rest } = q;
                    return { ...rest, id: _id };
                });
            } else {
                questions = await Question.find(query);
            }
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
