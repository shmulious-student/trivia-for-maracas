
import mongoose from 'mongoose';
import { Question } from '../src/models/Question';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI || 'mongodb://localhost:27017/trivia';

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find questions without random field
        const query = { random: { $exists: false } };
        const count = await Question.countDocuments(query);
        console.log(`Found ${count} questions missing the 'random' field.`);

        if (count === 0) {
            console.log('No migration needed.');
            return;
        }

        console.log('Starting migration...');

        // Update in batches or one by one to ensure randomness?
        // updateMany with a static value wouldn't work for random.
        // We need to iterate and save.

        const cursor = Question.find(query).cursor();
        let processed = 0;

        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            doc.random = Math.random();
            await doc.save();
            processed++;
            if (processed % 100 === 0) {
                console.log(`Processed ${processed}/${count} questions...`);
            }
        }

        console.log(`✅ Successfully migrated ${processed} questions.`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

main();
