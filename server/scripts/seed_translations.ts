import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { UITranslation } from '../src/models/UITranslation';

const envPath = path.resolve(process.cwd(), 'server/.env');
dotenv.config({ path: envPath });
console.log(`Loading .env from: ${envPath}`);

const MONGO_URI = process.env.MONGODB_URI;
const MONGO_URI_PROD = process.env.MONGODB_URI_PROD; // Assuming this might exist, or we pass it via env

if (!MONGO_URI) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
}

const connectDB = async (uri: string) => {
    try {
        await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${uri}`);
    } catch (err) {
        console.error(`Error connecting to ${uri}:`, err);
        process.exit(1);
    }
};

const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
    return Object.keys(obj).reduce((acc: any, k: string) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
};

const seedTranslations = async () => {
    try {
        // Load JSON files
        const enPath = path.resolve(process.cwd(), 'client/src/locales/en.json');
        const hePath = path.resolve(process.cwd(), 'client/src/locales/he.json');

        const enRaw = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
        const heRaw = JSON.parse(fs.readFileSync(hePath, 'utf-8'));

        const enFlat = flattenObject(enRaw);
        const heFlat = flattenObject(heRaw);

        // Get all unique keys
        const allKeys = new Set([...Object.keys(enFlat), ...Object.keys(heFlat)]);
        const operations: any[] = [];

        allKeys.forEach(key => {
            const enText = enFlat[key] || '';
            const heText = heFlat[key] || '';

            // Determine category based on key prefix
            const category = key.split('.')[0] || 'common';

            operations.push({
                updateOne: {
                    filter: { key },
                    update: {
                        $set: {
                            key,
                            category,
                            text: {
                                en: enText,
                                he: heText
                            }
                        }
                    },
                    upsert: true
                }
            });
        });

        if (operations.length > 0) {
            const result = await UITranslation.bulkWrite(operations);
            console.log(`Seeded ${operations.length} translations.`);
            console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);
        } else {
            console.log('No translations to seed.');
        }

    } catch (error) {
        console.error('Error seeding translations:', error);
    }
};

const run = async () => {
    const targetEnv = process.argv[2]; // 'dev' or 'prod'

    if (targetEnv === 'prod') {
        if (!MONGO_URI_PROD) {
            console.error('MONGO_URI_PROD is not defined in .env');
            // Check if user provided it as argument
            if (process.argv[3]) {
                await connectDB(process.argv[3]);
            } else {
                console.error('Please provide prod URI as 2nd argument or set MONGO_URI_PROD in .env');
                process.exit(1);
            }
        } else {
            await connectDB(MONGO_URI_PROD);
        }
    } else {
        await connectDB(MONGO_URI);
    }

    await seedTranslations();
    await mongoose.disconnect();
};

run();
