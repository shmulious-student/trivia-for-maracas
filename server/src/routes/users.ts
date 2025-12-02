import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User } from '../models/User';
import { authenticate as protect } from '../middleware/auth';

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/avatars');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

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

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Find user first to get old avatar
        const user = await User.findById(req.user.id);

        if (!user) {
            // Clean up the uploaded file if user not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old avatar if it exists
        if (user.avatarUrl) {
            const oldAvatarPath = path.join(__dirname, '../../', user.avatarUrl);
            if (fs.existsSync(oldAvatarPath)) {
                try {
                    fs.unlinkSync(oldAvatarPath);
                } catch (err) {
                    console.error('Failed to delete old avatar:', err);
                }
            }
        }

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

        // Delete avatar if exists
        if (user.avatarUrl) {
            const avatarPath = path.join(__dirname, '../../', user.avatarUrl);
            if (fs.existsSync(avatarPath)) {
                try {
                    fs.unlinkSync(avatarPath);
                } catch (err) {
                    console.error('Failed to delete avatar:', err);
                }
            }
        }

        await User.findByIdAndDelete(req.user.id);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
