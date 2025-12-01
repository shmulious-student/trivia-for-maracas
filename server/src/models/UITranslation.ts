import mongoose, { Schema, Document } from 'mongoose';
import { IUITranslation, IMultilingualText } from '@trivia/shared';

export interface IUITranslationDocument extends Omit<IUITranslation, 'id'>, Document { }

const MultilingualTextSchema = new Schema<IMultilingualText>({
    en: { type: String, required: true },
    he: { type: String, required: true }
}, { _id: false, strict: false });

const UITranslationSchema = new Schema<IUITranslationDocument>({
    key: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    text: { type: MultilingualTextSchema, required: true }
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

export const UITranslation = mongoose.model<IUITranslationDocument>('UITranslation', UITranslationSchema);
