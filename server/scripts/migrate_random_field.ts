import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { Question } from '../src/models/Question';

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || '');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const migrate = async () => {
    await connectDB();

    console.log('Starting migration...');
    const questions = await Question.find({ random: { $exists: false } });
    console.log(`Found ${questions.length} questions to update.`);

    let count = 0;
    for (const q of questions) {
        q.random = Math.random();
        await q.save();
        count++;
        if (count % 100 === 0) {
            console.log(`Updated ${count} questions...`);
        }
    }

    console.log('Migration complete.');
    process.exit(0);
};

migrate();
