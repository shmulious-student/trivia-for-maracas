import mongoose, { Schema, Document } from 'mongoose';
import { IQuestion, IMultilingualText } from '@trivia/shared';

export interface IQuestionDocument extends Omit<IQuestion, 'id'>, Document { }

const MultilingualTextSchema = new Schema<IMultilingualText>({
    en: { type: String, required: true },
    he: { type: String, required: true }
}, { _id: false, strict: false });

export const QuestionSchema = new Schema<IQuestionDocument>({
    subjectId: { type: Schema.Types.ObjectId, required: true, ref: 'Subject' },
    text: { type: MultilingualTextSchema, required: true },
    options: {
        type: [
            {
                text: { type: MultilingualTextSchema, required: true }
            }
        ], required: true
    },
    correctAnswerIndex: { type: Number, required: true },
    sourceUrl: { type: String, required: false },
    sourceQuote: { type: String, required: false },
    random: { type: Number, default: Math.random }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

// Indexes
QuestionSchema.index({ subjectId: 1 });
QuestionSchema.index({ random: 1 });
QuestionSchema.index({ subjectId: 1, random: 1 });

export const Question = mongoose.model<IQuestionDocument>('Question', QuestionSchema);
