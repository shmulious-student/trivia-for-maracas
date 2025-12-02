#!/usr/bin/env ts-node

/**
 * Import Production Data Script
 * This script imports data from JSON files to production MongoDB
 * 
 * Usage: MONGODB_URI="your-production-connection-string" ts-node scripts/import-data.ts
 */

import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// Import models
import { Subject } from '../src/models/Subject';
import { Question } from '../src/models/Question';
import { UITranslation } from '../src/models/UITranslation';

const EXPORT_DIR = path.join(__dirname, '../exports');

async function importData() {
    try {
        // Get production MongoDB URI from command line argument or environment
        const productionUri = process.argv[2] || process.env.MONGODB_URI;

        if (!productionUri) {
            console.error('❌ Error: Please provide MongoDB connection string');
            console.log('Usage: ts-node scripts/import-data.ts "mongodb+srv://..."');
            console.log('Or: MONGODB_URI="mongodb+srv://..." ts-node scripts/import-data.ts');
            process.exit(1);
        }

        console.log('📦 Connecting to production MongoDB...');
        await mongoose.connect(productionUri);
        console.log('✅ Connected to production MongoDB\n');

        // Check if export files exist
        const subjectsFile = path.join(EXPORT_DIR, 'subjects.json');
        const questionsFile = path.join(EXPORT_DIR, 'questions.json');
        const translationsFile = path.join(EXPORT_DIR, 'ui-translations.json');

        if (!fs.existsSync(subjectsFile) || !fs.existsSync(questionsFile) || !fs.existsSync(translationsFile)) {
            console.error('❌ Error: Export files not found!');
            console.log('Please run: npm run export-data first');
            process.exit(1);
        }

        // Import Subjects
        console.log('📤 Importing Subjects...');
        const subjectsData = JSON.parse(fs.readFileSync(subjectsFile, 'utf-8'));
        // Remove _id and __v fields to let MongoDB generate new ones
        const subjectsToInsert = subjectsData.map((s: any) => {
            const { _id, __v, ...rest } = s;
            return rest;
        });

        // Create a mapping of old IDs to new IDs
        const subjectIdMap = new Map<string, string>();

        if (subjectsToInsert.length > 0) {
            await Subject.deleteMany({}); // Clear existing

            // Insert subjects and capture the new IDs
            const insertedSubjects = await Subject.insertMany(subjectsToInsert);

            // Map old IDs to new IDs
            subjectsData.forEach((oldSubject: any, index: number) => {
                const newSubject = insertedSubjects[index];
                subjectIdMap.set(oldSubject._id.toString(), newSubject._id.toString());
            });

            console.log(`✅ Imported ${subjectsToInsert.length} subjects\n`);
        }

        // Import Questions with updated subject IDs
        console.log('📤 Importing Questions...');
        const questionsData = JSON.parse(fs.readFileSync(questionsFile, 'utf-8'));
        const questionsToInsert = questionsData.map((q: any) => {
            const { _id, __v, ...rest } = q;

            // Update subjectId to use the new ID
            if (rest.subjectId && subjectIdMap.has(rest.subjectId.toString())) {
                rest.subjectId = subjectIdMap.get(rest.subjectId.toString());
            }

            return rest;
        });

        if (questionsToInsert.length > 0) {
            await Question.deleteMany({}); // Clear existing
            await Question.insertMany(questionsToInsert);
            console.log(`✅ Imported ${questionsToInsert.length} questions\n`);
        }

        // Import UI Translations
        console.log('📤 Importing UI Translations...');
        const translationsData = JSON.parse(fs.readFileSync(translationsFile, 'utf-8'));
        const translationsToInsert = translationsData.map((t: any) => {
            const { _id, __v, ...rest } = t;
            return rest;
        });

        if (translationsToInsert.length > 0) {
            await UITranslation.deleteMany({}); // Clear existing
            await UITranslation.insertMany(translationsToInsert);
            console.log(`✅ Imported ${translationsToInsert.length} UI translations\n`);
        }

        console.log('🎉 Import complete!');
        console.log('✨ Your production database is now populated with data!');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
}

importData();
