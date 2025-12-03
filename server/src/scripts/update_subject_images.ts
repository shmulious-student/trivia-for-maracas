import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Subject, SubjectSchema } from '../models/Subject';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI_DEV = process.env.MONGODB_URI || 'mongodb://localhost:27017/trivia';
const MONGODB_URI_PROD = process.env.MONGODB_URI_PROD;

const imageMappings: Record<string, string> = {
    'Berry Sakharoff': '/subjects/card_images/berry-sakharoff.png',
    'Charli XCX': '/subjects/card_images/cxc-charli.png',
    'FC Barcelona': '/subjects/card_images/fc-barcelona.png',
    'Grunge Heroes': '/subjects/card_images/grunge-music.png',
    'Israeli Rock': '/subjects/card_images/israeli-rock.png',
    'Kink and BDSM': '/subjects/card_images/kink-and-bdsm.png',
    'Tool': '/subjects/card_images/tool.png',
    'The Name Yuval': '/subjects/card_images/yuval.png',
    'Our Song (Israeli TV Series)': '/subjects/card_images/our-song.png'
};

const updateSubjectsInDB = async (uri: string, envName: string) => {
    console.log(`\nConnecting to ${envName} DB...`);
    const conn = await mongoose.createConnection(uri).asPromise();
    const SubjectModel = conn.model('Subject', SubjectSchema);

    // Since Subject export in models/Subject.ts is a model, we need the schema.
    // But wait, mongoose.model('Subject', Subject.schema) works if Subject is a model.

    for (const [subjectName, imagePath] of Object.entries(imageMappings)) {
        const result = await SubjectModel.updateOne(
            { 'name.en': subjectName },
            { $set: { coverImage: imagePath } }
        );
        console.log(`[${envName}] Updated ${subjectName}: ${result.modifiedCount > 0 ? 'Success' : 'Not Found/No Change'}`);
    }

    await conn.close();
};

const main = async () => {
    try {
        await updateSubjectsInDB(MONGODB_URI_DEV, 'DEV');

        if (MONGODB_URI_PROD) {
            await updateSubjectsInDB(MONGODB_URI_PROD, 'PROD');
        } else {
            console.log('\n⚠️  MONGODB_URI_PROD not found. Skipping Production update.');
        }

        console.log('\nFinished updating subject images.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating subjects:', error);
        process.exit(1);
    }
};

main();
