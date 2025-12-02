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

const clearDb = async () => {
    await connectDB();

    const args = process.argv.slice(2);
    const clearAll = args.includes('--all');
    const clearUsers = args.includes('--users');
    const clearQuestions = args.includes('--questions');
    const clearLeaderboard = args.includes('--leaderboard');
    const clearTranslations = args.includes('--translations');
    const clearConfig = args.includes('--config');

    if (args.length === 0) {
        console.log(`
Usage: ts-node src/clearDb.ts [flags]

Flags:
  --all           Clear ALL data
  --users         Clear Users
  --questions     Clear Questions and Subjects
  --leaderboard   Clear Leaderboard (Game Results)
  --translations  Clear UI Translations
  --config        Clear Config
        `);
        process.exit(0);
    }

    try {
        if (clearAll || clearUsers) {
            await User.deleteMany({});
            console.log('🗑️  Users cleared');
        }

        if (clearAll || clearQuestions) {
            await Question.deleteMany({});
            await Subject.deleteMany({});
            console.log('🗑️  Questions and Subjects cleared');
        }

        if (clearAll || clearLeaderboard) {
            await GameResult.deleteMany({});
            console.log('🗑️  Leaderboard cleared');
        }

        if (clearAll || clearTranslations) {
            await UITranslation.deleteMany({});
            console.log('🗑️  UI Translations cleared');
        }

        if (clearAll || clearConfig) {
            await Config.deleteMany({});
            console.log('🗑️  Config cleared');
        }

        console.log('✨ Database cleanup complete');
    } catch (error) {
        console.error('❌ Error clearing database:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

clearDb();
