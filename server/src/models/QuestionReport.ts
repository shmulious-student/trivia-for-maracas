import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestionReport extends Document {
    userId?: mongoose.Types.ObjectId;
    questionId: mongoose.Types.ObjectId;
    reportType: string[]; // 'text', 'answers', 'correctAnswer', 'other'
    suggestedCorrection?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
    createdAt: Date;
}

const QuestionReportSchema = new Schema<IQuestionReport>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    reportType: [{ type: String, required: true }],
    suggestedCorrection: { type: String, required: false },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'rejected'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

export const QuestionReport = mongoose.model<IQuestionReport>('QuestionReport', QuestionReportSchema);
