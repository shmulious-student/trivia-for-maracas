import mongoose, { Document, Schema } from 'mongoose';

export interface ISubjectReport extends Document {
    subjectId: mongoose.Types.ObjectId;
    questions: Array<{
        text: { en: string; he: string };
        sourceUrl: string;
        sourceQuote: string;
        answer: string;
    }>;
    createdAt: Date;
}

const SubjectReportSchema = new Schema<ISubjectReport>({
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    questions: [{
        text: {
            en: { type: String, required: true },
            he: { type: String, required: true }
        },
        sourceUrl: { type: String, required: true },
        sourceQuote: { type: String, required: true },
        answer: { type: String, required: true }
    }],
    createdAt: { type: Date, default: Date.now }
});

export const SubjectReport = mongoose.model<ISubjectReport>('SubjectReport', SubjectReportSchema);
