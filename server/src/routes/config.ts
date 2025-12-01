import express from 'express';
import { Config } from '../models/Config';

const router = express.Router();

// Get Config by Type
router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const config = await Config.findOne({ type });
        if (!config) {
            return res.status(404).json({ message: 'Config not found' });
        }
        res.json(config.data);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Update Config by Type
router.put('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { data } = req.body;

        const config = await Config.findOneAndUpdate(
            { type },
            { data },
            { new: true, upsert: true }
        );
        res.json(config.data);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

export default router;
