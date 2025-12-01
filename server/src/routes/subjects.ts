import express from 'express';
import { Subject } from '../models/Subject';

const router = express.Router();
import { importExportService } from '../services/import-export.service';

// Export All
router.get('/export', async (req, res) => {
    try {
        const data = await importExportService.exportAll();
        res.header('Content-Disposition', 'attachment; filename="trivia_export.json"');
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Export failed', error });
    }
});

// Import Data
router.post('/import', async (req, res) => {
    try {
        const data = req.body; // Assuming JSON body parser is active and max limit is high enough
        const result = await importExportService.importData(data);
        res.json({ message: 'Import successful', result });
    } catch (error) {
        res.status(500).json({ message: 'Import failed', error });
    }
});

// Export Single Subject
router.get('/:id/export', async (req, res) => {
    try {
        const data = await importExportService.exportSubject(req.params.id);
        res.header('Content-Disposition', `attachment; filename="subject_${req.params.id}.json"`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Export failed', error });
    }
});


// Get All Subjects with Question Count
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.aggregate([
            {
                $lookup: {
                    from: 'questions',
                    localField: '_id',
                    foreignField: 'subjectId',
                    as: 'questions'
                }
            },
            {
                $project: {
                    id: '$_id',
                    name: 1,
                    questionCount: { $size: '$questions' },
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Create Subject
router.post('/', async (req, res) => {
    try {
        const subject = new Subject(req.body);
        await subject.save();
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Update Subject
router.put('/:id', async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json(subject);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Delete Subject and its Questions
router.delete('/:id', async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        // Delete all questions associated with this subject
        // We need to import Question model dynamically or move it to top if not circular
        const { Question } = await import('../models/Question');
        await Question.deleteMany({ subjectId: req.params.id });

        res.json({ message: 'Subject and associated questions deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

export default router;
