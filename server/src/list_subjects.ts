import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Subject } from './models/Subject';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trivia';

const listSubjects = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const subjects = await Subject.find({});
        console.log('Found subjects:', subjects.map(s => ({ id: s._id, name: s.name })));

        process.exit(0);
    } catch (error) {
        console.error('Error listing subjects:', error);
        process.exit(1);
    }
};

listSubjects();
