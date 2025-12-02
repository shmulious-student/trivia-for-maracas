import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from './models/User';
import { Question } from './models/Question';
import { Subject } from './models/Subject';
import { GameResult } from './models/GameResult';
import { UITranslation } from './models/UITranslation';
import { Config } from './models/Config';

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

const cleanupSpecificData = async () => {
    await connectDB();

    try {
        // 1. Find preserved subjects
        const preservedSubjects = await Subject.find({
            $or: [
                { 'name.he': 'השיר שלנו' },
                { 'name.en': 'FC barcelona' },
                { 'name.he': 'FC barcelona' } // In case it was saved with Hebrew key but English text, or just to be safe
            ]
        });

        const preservedSubjectIds = preservedSubjects.map(s => s._id);
        console.log(`Found ${preservedSubjects.length} subjects to preserve:`, preservedSubjects.map(s => s.name.en || s.name.he));

        // 2. Delete all Users
        const usersResult = await User.deleteMany({});
        console.log(`🗑️  Deleted ${usersResult.deletedCount} users`);

        // 3. Delete all GameResults (Leaderboard)
        const gameResultsResult = await GameResult.deleteMany({});
        console.log(`🗑️  Deleted ${gameResultsResult.deletedCount} game results`);

        // 4. Delete Subjects NOT in preserved list
        const subjectsResult = await Subject.deleteMany({
            _id: { $nin: preservedSubjectIds }
        });
        console.log(`🗑️  Deleted ${subjectsResult.deletedCount} subjects`);

        // 5. Delete Questions NOT belonging to preserved subjects
        const questionsResult = await Question.deleteMany({
            subjectId: { $nin: preservedSubjectIds }
        });
        console.log(`🗑️  Deleted ${questionsResult.deletedCount} questions`);

        // 6. Config - Optional, user didn't explicitly say to keep or delete, but usually config is system-wide. 
        // The user said "remove users, leaderboards data, subjects and questions other the subjects I mentioned etc."
        // "etc" implies other user-generated or game-generated data. Config might be considered system setup.
        // I'll leave Config alone for now as it wasn't explicitly requested to be deleted and might contain important settings.
        // If I were to delete it: await Config.deleteMany({});

        console.log('✨ Database cleanup complete');

    } catch (error) {
        console.error('❌ Error cleaning database:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

cleanupSpecificData();
