import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Subject } from './models/Subject';
import { Question } from './models/Question';
import { User } from './models/User';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const verifyDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ MongoDB Connected');

        const userCount = await User.countDocuments();
        const subjectCount = await Subject.countDocuments();
        const questionCount = await Question.countDocuments();
        const translationCount = await import('./models/UITranslation').then(m => m.UITranslation.countDocuments());
        const subjects = await Subject.find({});

        console.log(`Users: ${userCount}`);
        console.log(`Subjects: ${subjectCount}`);
        console.log(`Questions: ${questionCount}`);
        console.log(`UI Translations: ${translationCount}`);
        console.log('Remaining Subjects:', subjects.map(s => ({ en: s.name.en, he: s.name.he })));

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyDb();
