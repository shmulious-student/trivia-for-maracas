
import mongoose from 'mongoose';
import { Question } from '../src/models/Question';
import { QuestionService } from '../src/services/question.service';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trivia';

async function main() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const subjectId = '692f8949a898206be49e198a'; // The ID from user report

        // 1. Check if questions exist
        const count = await Question.countDocuments({ subjectId });
        console.log(`Found ${count} questions for subject ${subjectId}`);

        if (count === 0) {
            console.log('Creating dummy questions...');
            // Create dummy questions
            const questions = [];
            for (let i = 0; i < 50; i++) {
                questions.push({
                    subjectId,
                    text: { en: `Question ${i}`, he: `שאלה ${i}` },
                    options: [
                        { text: { en: 'A', he: 'א' } },
                        { text: { en: 'B', he: 'ב' } },
                        { text: { en: 'C', he: 'ג' } },
                        { text: { en: 'D', he: 'ד' } }
                    ],
                    correctAnswerIndex: 0,
                    random: Math.random()
                });
            }
            await Question.insertMany(questions);
            console.log('Created 50 questions.');
        }

        // 2. Run Service Query
        console.log('Running QuestionService.getQuestionsForGame...');
        const results = await QuestionService.getQuestionsForGame(subjectId, 10);
        console.log(`Service returned ${results.length} questions.`);

        if (results.length === 0) {
            console.log('❌ Service returned empty array!');
        } else {
            console.log('✅ Service returned questions.');
        }

        // 3. Simulate missing random field
        console.log('\nSimulating missing random field...');
        await Question.updateMany({ subjectId }, { $unset: { random: "" } });

        const resultsMissingRandom = await QuestionService.getQuestionsForGame(subjectId, 10);
        console.log(`Service returned ${resultsMissingRandom.length} questions (after unsetting random).`);

        if (resultsMissingRandom.length === 0) {
            console.log('❌ Service returned empty array when random field is missing! THIS IS THE CAUSE.');
        } else {
            console.log('✅ Service still returned questions (unexpected).');
        }

        // 4. Restore random field
        console.log('\nRestoring random field...');
        const questionsToUpdate = await Question.find({ subjectId });
        for (const q of questionsToUpdate) {
            q.random = Math.random();
            await q.save();
        }
        console.log('Restored random field.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
