import mongoose, { Schema, Document } from 'mongoose';
import { ISubject, IMultilingualText } from '@trivia/shared';

export interface ISubjectDocument extends Omit<ISubject, 'id'>, Document { }

const MultilingualTextSchema = new Schema<IMultilingualText>({
    en: { type: String, required: true },
    he: { type: String, required: true }
}, { _id: false, strict: false });

const SubjectSchema = new Schema<ISubjectDocument>({
    name: { type: MultilingualTextSchema, required: true }
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

export const Subject = mongoose.model<ISubjectDocument>('Subject', SubjectSchema);
