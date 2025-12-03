import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Subject } from '../models/Subject';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trivia';

const updateImages = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

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

        for (const [subjectName, imagePath] of Object.entries(imageMappings)) {
            const result = await Subject.updateOne(
                { 'name.en': subjectName },
                { $set: { coverImage: imagePath } }
            );
            console.log(`Updated ${subjectName}: ${result.modifiedCount > 0 ? 'Success' : 'Not Found/No Change'}`);
        }

        console.log('Finished updating subject images.');

        process.exit(0);
    } catch (error) {
        console.error('Error updating subjects:', error);
        process.exit(1);
    }
};

updateImages();
