import express from 'express';
import { UITranslation } from '../models/UITranslation';

const router = express.Router();

// Get All Translations (as a map for frontend)
router.get('/map', async (req, res) => {
    try {
        const translations = await UITranslation.find();
        const map: Record<string, any> = {};
        translations.forEach(t => {
            map[t.key] = t.text;
        });
        res.json(map);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Get All Translations (List for Backoffice)
router.get('/', async (req, res) => {
    try {
        const translations = await UITranslation.find().sort({ category: 1, key: 1 });
        res.json(translations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Create Translation
router.post('/', async (req, res) => {
    try {
        const translation = new UITranslation(req.body);
        await translation.save();
        res.status(201).json(translation);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Update Translation
router.put('/:id', async (req, res) => {
    try {
        const translation = await UITranslation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!translation) {
            return res.status(404).json({ message: 'Translation not found' });
        }
        res.json(translation);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Delete Translation
router.delete('/:id', async (req, res) => {
    try {
        const translation = await UITranslation.findByIdAndDelete(req.params.id);
        if (!translation) {
            return res.status(404).json({ message: 'Translation not found' });
        }
        res.json({ message: 'Translation deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

export default router;
