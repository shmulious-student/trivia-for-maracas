import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Subject } from '../src/models/Subject';
import { Question } from '../src/models/Question';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trivia';

interface QuestionData {
    text: { en: string; he: string };
    options: Array<{ text: { en: string; he: string } }>;
    correctAnswerIndex: number;
}

interface SubjectData {
    name: { en: string; he: string };
    description?: { en: string; he: string };
}

/**
 * Generic script to create questions for a subject
 * 
 * Usage:
 *   # With existing subject ID:
 *   npx ts-node scripts/create_questions_of_subject.ts <subject-id> <questions-json-file>
 * 
 *   # Create new subject:
 *   npx ts-node scripts/create_questions_of_subject.ts new <subject-json-file> <questions-json-file>
 * 
 * JSON File Formats:
 * 
 * subject.json:
 * {
 *   "name": { "en": "Subject Name", "he": "שם הנושא" },
 *   "description": { "en": "Description", "he": "תיאור" }  // optional
 * }
 * 
 * questions.json:
 * [
 *   {
 *     "text": { "en": "Question?", "he": "שאלה?" },
 *     "options": [
 *       { "text": { "en": "Option 1", "he": "אפשרות 1" } },
 *       { "text": { "en": "Option 2", "he": "אפשרות 2" } },
 *       { "text": { "en": "Option 3", "he": "אפשרות 3" } },
 *       { "text": { "en": "Option 4", "he": "אפשרות 4" } }
 *     ],
 *     "correctAnswerIndex": 0
 *   }
 * ]
 */

import { SubjectReport } from '../src/models/SubjectReport';

interface ReportData {
    questions: Array<{
        text: { en: string; he: string };
        sourceUrl: string;
        sourceQuote: string;
        answer: string;
    }>;
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage:');
        console.error('  With existing subject: npx ts-node scripts/create_questions_of_subject.ts <subject-id> <questions-json-file> [report-json-file]');
        console.error('  Create new subject:    npx ts-node scripts/create_questions_of_subject.ts new <subject-json-file> <questions-json-file> [report-json-file]');
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    let subjectId: any;
    let questionsFile: string;
    let reportFile: string | undefined;

    if (args[0] === 'new') {
        // Create new subject
        if (args.length < 3) {
            console.error('Error: When creating a new subject, provide both subject JSON file and questions JSON file');
            process.exit(1);
        }

        const subjectFile = args[1];
        questionsFile = args[2];
        reportFile = args[3];

        // Read and validate subject data
        if (!fs.existsSync(subjectFile)) {
            console.error(`Error: Subject file not found: ${subjectFile}`);
            process.exit(1);
        }

        const subjectData: SubjectData = JSON.parse(fs.readFileSync(subjectFile, 'utf-8'));

        // Validate subject data
        if (!subjectData.name?.en || !subjectData.name?.he) {
            console.error('Error: Subject must have name.en and name.he');
            process.exit(1);
        }

        // Create subject
        const subject = await Subject.create(subjectData);
        subjectId = subject._id;
        console.log(`✅ Created new subject: ${subject.name.en} / ${subject.name.he}`);
        console.log(`📋 Subject ID: ${subjectId}\n`);
    } else {
        // Use existing subject
        subjectId = args[0];
        questionsFile = args[1];
        reportFile = args[2];

        // Verify subject exists
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            console.error(`Error: Subject not found with ID: ${subjectId}`);
            process.exit(1);
        }

        console.log(`📋 Using existing subject: ${subject.name.en} / ${subject.name.he}`);
        console.log(`📋 Subject ID: ${subjectId}\n`);
    }

    // Read and validate questions data
    if (!fs.existsSync(questionsFile)) {
        console.error(`Error: Questions file not found: ${questionsFile}`);
        process.exit(1);
    }

    const questionsData: QuestionData[] = JSON.parse(fs.readFileSync(questionsFile, 'utf-8'));

    if (!Array.isArray(questionsData)) {
        console.error('Error: Questions file must contain an array of questions');
        process.exit(1);
    }

    // Validate questions
    for (let i = 0; i < questionsData.length; i++) {
        const q = questionsData[i];
        if (!q.text?.en || !q.text?.he) {
            console.error(`Error: Question ${i + 1} must have text.en and text.he`);
            process.exit(1);
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
            console.error(`Error: Question ${i + 1} must have exactly 4 options`);
            process.exit(1);
        }
        for (let j = 0; j < q.options.length; j++) {
            if (!q.options[j].text?.en || !q.options[j].text?.he) {
                console.error(`Error: Question ${i + 1}, Option ${j + 1} must have text.en and text.he`);
                process.exit(1);
            }
        }
        if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
            console.error(`Error: Question ${i + 1} must have correctAnswerIndex between 0-3`);
            process.exit(1);
        }
    }

    console.log(`📝 Validated ${questionsData.length} questions`);

    // Add questions to database
    const questionsToInsert = questionsData.map(q => ({
        ...q,
        subjectId
    }));

    const result = await Question.insertMany(questionsToInsert);
    console.log(`✅ Successfully added ${result.length} questions to database\n`);

    // Handle Report
    if (reportFile) {
        if (fs.existsSync(reportFile)) {
            try {
                const reportData: ReportData = JSON.parse(fs.readFileSync(reportFile, 'utf-8'));
                // Validate report structure loosely
                if (reportData.questions && Array.isArray(reportData.questions)) {
                    await SubjectReport.create({
                        subjectId: subjectId,
                        questions: reportData.questions
                    });
                    console.log(`✅ Successfully saved subject report to database`);
                } else {
                    console.warn('⚠️ Report file format invalid (missing questions array), skipping report save.');
                }
            } catch (e) {
                console.error('⚠️ Failed to save report:', e);
            }
        } else {
            console.warn(`⚠️ Report file not found: ${reportFile}, skipping report save.`);
        }
    }

    // Display summary
    const totalQuestions = await Question.countDocuments({ subjectId });
    console.log(`📊 Total questions for this subject: ${totalQuestions}`);

    process.exit(0);
}

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
