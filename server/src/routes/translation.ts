import express from 'express';
import { translationService } from '../services/translation.service';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { text, from, to } = req.body;

        if (!text || !from || !to) {
            return res.status(400).json({ message: 'Missing required fields: text, from, to' });
        }

        const translatedText = await translationService.translate(text, from, to);
        res.json({ translatedText });
    } catch (error) {
        res.status(500).json({ message: 'Translation failed', error });
    }
});

export default router;
