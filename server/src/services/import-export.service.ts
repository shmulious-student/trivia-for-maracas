import { Subject } from '../models/Subject';
import { Question } from '../models/Question';
import { ISubject, IQuestion, IImportData } from '@trivia/shared';

export class ImportExportService {
    async exportAll(): Promise<IImportData> {
        const subjects = await Subject.find().lean();
        const questions = await Question.find().lean();

        // Clean up internal fields
        const cleanSubjects = subjects.map(this.cleanDoc);
        const cleanQuestions = questions.map(this.cleanDoc);

        return {
            subjects: cleanSubjects as ISubject[],
            questions: cleanQuestions as IQuestion[]
        };
    }

    async exportSubject(subjectId: string): Promise<IImportData> {
        const subject = await Subject.findById(subjectId).lean();
        if (!subject) throw new Error('Subject not found');

        const questions = await Question.find({ subjectId }).lean();

        return {
            subjects: [this.cleanDoc(subject) as ISubject],
            questions: questions.map(this.cleanDoc) as IQuestion[]
        };
    }

    async importData(data: IImportData): Promise<{ subjects: number, questions: number }> {
        let subjectCount = 0;
        let questionCount = 0;

        // Import Subjects
        for (const subj of data.subjects) {
            // Check if exists by ID or Name (to prevent duplicates if ID changed)
            // For now, we'll upsert by ID if present, or create new
            if (subj.id) {
                await Subject.findByIdAndUpdate(subj.id, subj, { upsert: true });
                subjectCount++;
            } else {
                // Create new
                const newSubj = new Subject(subj);
                await newSubj.save();
                subjectCount++;
                // Note: Questions linking to this subject will fail if we don't map the ID.
                // This is a complex case. For now assuming ID is preserved or we are importing fresh.
            }
        }

        // Import Questions
        for (const q of data.questions) {
            if (q.id) {
                await Question.findByIdAndUpdate(q.id, q, { upsert: true });
                questionCount++;
            } else {
                await new Question(q).save();
                questionCount++;
            }
        }

        return { subjects: subjectCount, questions: questionCount };
    }

    private cleanDoc(doc: any): any {
        const { _id, __v, createdAt, updatedAt, ...rest } = doc;
        return { id: _id, ...rest };
    }
}

export const importExportService = new ImportExportService();
