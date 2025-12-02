import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User } from '../models/User';
import { authenticate as protect } from '../middleware/auth';

const router = express.Router();

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'trivia-avatars',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    } as any // Type assertion needed for some multer-storage-cloudinary versions
});

const upload = multer({ storage: storage });

// Search Users (Public)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        const query: any = {};

        if (q && typeof q === 'string') {
            query.username = { $regex: q, $options: 'i' };
        }

        const users = await User.find(query)
            .select('username avatarUrl preferences.gender')
            .limit(20); // Limit results

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Upload Avatar
router.post('/avatar', protect, upload.single('avatar'), async (req: any, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Cloudinary returns the URL in path
        const avatarUrl = req.file.path;

        // Find user first to get old avatar
        const user = await User.findById(req.user.id);

        if (!user) {
            // Cloudinary cleanup would be needed here if we wanted to be strict, 
            // but for now we just return error
            return res.status(404).json({ message: 'User not found' });
        }

        // Note: We don't delete old avatars from Cloudinary automatically to avoid deleting shared resources
        // or complex logic. Cloudinary has auto-cleanup features if needed.

        // Update user
        user.avatarUrl = avatarUrl;
        await user.save();

        res.json({ message: 'Avatar uploaded successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Profile
router.put('/profile', protect, async (req: any, res) => {
    try {
        const { username, preferences } = req.body;

        // Check if username exists
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        const updateData: any = {};
        if (username) updateData.username = username;
        if (preferences) updateData.preferences = preferences;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete User
router.delete('/profile', protect, async (req: any, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Note: We don't delete avatar from Cloudinary automatically here

        await User.findByIdAndDelete(req.user.id);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
