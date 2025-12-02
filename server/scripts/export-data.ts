#!/usr/bin/env ts-node

/**
 * Export Production Data Script
 * This script exports all data from your local MongoDB to JSON files
 */

import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import { Subject } from '../src/models/Subject';
import { Question } from '../src/models/Question';
import { UITranslation } from '../src/models/UITranslation';

const EXPORT_DIR = path.join(__dirname, '../exports');

async function exportData() {
    try {
        // Connect to LOCAL MongoDB
        const localUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trivia';
        console.log('📦 Connecting to local MongoDB...');
        await mongoose.connect(localUri);
        console.log('✅ Connected to local MongoDB\n');

        // Create exports directory if it doesn't exist
        if (!fs.existsSync(EXPORT_DIR)) {
            fs.mkdirSync(EXPORT_DIR, { recursive: true });
        }

        // Export Subjects
        console.log('📥 Exporting Subjects...');
        const subjects = await Subject.find({}).lean();
        fs.writeFileSync(
            path.join(EXPORT_DIR, 'subjects.json'),
            JSON.stringify(subjects, null, 2)
        );
        console.log(`✅ Exported ${subjects.length} subjects\n`);

        // Export Questions
        console.log('📥 Exporting Questions...');
        const questions = await Question.find({}).lean();
        fs.writeFileSync(
            path.join(EXPORT_DIR, 'questions.json'),
            JSON.stringify(questions, null, 2)
        );
        console.log(`✅ Exported ${questions.length} questions\n`);

        // Export UI Translations
        console.log('📥 Exporting UI Translations...');
        const translations = await UITranslation.find({}).lean();
        fs.writeFileSync(
            path.join(EXPORT_DIR, 'ui-translations.json'),
            JSON.stringify(translations, null, 2)
        );
        console.log(`✅ Exported ${translations.length} UI translations\n`);

        console.log('🎉 Export complete!');
        console.log(`📁 Files saved to: ${EXPORT_DIR}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Export failed:', error);
        process.exit(1);
    }
}

exportData();
