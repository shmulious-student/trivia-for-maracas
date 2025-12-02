import express from 'express';
import { QuestionReport } from '../models/QuestionReport';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Submit reports
router.post('/', authenticate, async (req, res) => {
    try {
        const { reports } = req.body;
        const userId = (req as any).user?.userId;

        if (!Array.isArray(reports) || reports.length === 0) {
            return res.status(400).json({ message: 'Invalid reports data' });
        }

        const reportDocs = reports.map(report => ({
            userId,
            questionId: report.questionId,
            reportType: report.reportType,
            suggestedCorrection: report.suggestedCorrection,
            status: 'pending'
        }));

        await QuestionReport.insertMany(reportDocs);

        res.status(201).json({ message: 'Reports submitted successfully' });
    } catch (error) {
        console.error('Error submitting reports:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
