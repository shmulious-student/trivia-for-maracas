import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { User } from '../src/models/User';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined');
        }
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const cleanupAvatars = async () => {
    await connectDB();

    try {
        // 1. Get all used avatar URLs
        const users = await User.find({});
        const usedAvatars = new Set<string>();
        users.forEach(user => {
            if (user.avatarUrl) {
                // Extract filename from URL (e.g., /uploads/avatars/foo.jpg -> foo.jpg)
                const filename = path.basename(user.avatarUrl);
                usedAvatars.add(filename);
            }
        });

        console.log(`Found ${users.length} users using ${usedAvatars.size} unique avatars.`);

        // 2. List all files in uploads/avatars
        const avatarsDir = path.resolve(__dirname, '../uploads/avatars');
        if (!fs.existsSync(avatarsDir)) {
            console.log('Avatars directory does not exist.');
            return;
        }

        const files = fs.readdirSync(avatarsDir);
        let deletedCount = 0;
        let keptCount = 0;

        // 3. Delete unused files
        for (const file of files) {
            // Skip non-image files if any (e.g., .DS_Store)
            if (file.startsWith('.')) continue;

            if (!usedAvatars.has(file)) {
                const filePath = path.join(avatarsDir, file);
                fs.unlinkSync(filePath);
                console.log(`🗑️  Deleted unused avatar: ${file}`);
                deletedCount++;
            } else {
                keptCount++;
            }
        }

        console.log(`\nCleanup Complete:`);
        console.log(`- Deleted: ${deletedCount}`);
        console.log(`- Kept: ${keptCount}`);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

cleanupAvatars();
