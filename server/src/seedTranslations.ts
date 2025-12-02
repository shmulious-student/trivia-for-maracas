import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UITranslation } from './models/UITranslation';

dotenv.config();

import fs from 'fs';
import path from 'path';

const getCategory = (key: string): string => {
    if (key.includes('.')) {
        return key.split('.')[0];
    }
    return 'common';
};

const loadTranslations = () => {
    const enPath = path.join(__dirname, '../../client/src/locales/en.json');
    const hePath = path.join(__dirname, '../../client/src/locales/he.json');

    const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    const he = JSON.parse(fs.readFileSync(hePath, 'utf-8'));

    const keys = new Set([...Object.keys(en), ...Object.keys(he)]);
    const translations: any[] = [];

    keys.forEach(key => {
        translations.push({
            key,
            category: getCategory(key),
            text: {
                en: en[key] || key,
                he: he[key] || key
            }
        });
    });

    return translations;
};

const seedTranslations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        await UITranslation.deleteMany({}); // Clear existing
        console.log('Cleared existing translations');

        await UITranslation.insertMany(loadTranslations());
        console.log('Seeded translations successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding translations:', error);
        process.exit(1);
    }
};

seedTranslations();
