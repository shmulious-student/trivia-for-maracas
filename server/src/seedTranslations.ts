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

const flattenKeys = (obj: any, prefix = ''): Record<string, string> => {
    let result: Record<string, string> = {};
    for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
            Object.assign(result, flattenKeys(value, newKey));
        } else {
            result[newKey] = value;
        }
    }
    return result;
};

const loadTranslations = () => {
    const enPath = path.join(__dirname, '../../client/src/locales/en.json');
    const hePath = path.join(__dirname, '../../client/src/locales/he.json');

    const enRaw = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    const heRaw = JSON.parse(fs.readFileSync(hePath, 'utf-8'));

    const en = flattenKeys(enRaw);
    const he = flattenKeys(heRaw);

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
