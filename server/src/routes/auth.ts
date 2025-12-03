import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { trackEvent } from '../services/analytics.service';
import { authenticate as protect } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_prod';

// Register (Player) - Auto-create or return existing
router.post('/register', async (req, res) => {
    try {
        const { username, avatarUrl, preferences } = req.body;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        let user = await User.findOne({ username });
        let isNewUser = false;

        if (!user) {
            user = new User({
                username,
                avatarUrl,
                isAdmin: false,
                preferences: preferences || {}
            });
            await user.save();
            isNewUser = true;
        } else {
            // Update avatar if provided
            if (avatarUrl) {
                user.avatarUrl = avatarUrl;
            }
            // Update preferences if provided (e.g. gender update during re-login/registration)
            if (preferences) {
                user.preferences = { ...user.preferences, ...preferences };
            }
            if (avatarUrl || preferences) {
                await user.save();
            }
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '30d' } // Long session for players
        );

        if (isNewUser) {
            trackEvent(user.id, 'user_registered', { username: user.username, role: 'player' });
        }
        trackEvent(user.id, 'user_login', { username: user.username, role: 'player' });

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Login (Admin)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user || !user.isAdmin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.password) {
            return res.status(401).json({ message: 'Admin setup incomplete' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        trackEvent(user.id, 'user_login', { username: user.username, role: 'admin' });

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Create Admin (One-time setup or protected route)
router.post('/create-admin', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if any admin exists
        const adminExists = await User.findOne({ isAdmin: true });
        if (adminExists) {
            return res.status(403).json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            isAdmin: true
        });

        await user.save();

        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Get Current User
router.get('/me', protect, async (req: any, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

export default router;
