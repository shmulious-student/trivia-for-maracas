import mongoose, { Schema, Document } from 'mongoose';
import { IQuestion, IMultilingualText } from '@trivia/shared';

export interface IQuestionDocument extends Omit<IQuestion, 'id'>, Document { }

const MultilingualTextSchema = new Schema<IMultilingualText>({
    en: { type: String, required: true },
    he: { type: String, required: true }
}, { _id: false, strict: false });

const QuestionSchema = new Schema<IQuestionDocument>({
    subjectId: { type: String, required: true, ref: 'Subject' },
    text: { type: MultilingualTextSchema, required: true },
    answers: { type: [MultilingualTextSchema], required: true },
    correctAnswerIndex: { type: Number, required: true }
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

export const Question = mongoose.model<IQuestionDocument>('Question', QuestionSchema);
