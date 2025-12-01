import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '@trivia/shared';

export interface IUserDocument extends Omit<IUser, 'id'>, Document { }

const UserSchema = new Schema<IUserDocument>({
    username: { type: String, required: true, unique: true },
    avatarUrl: { type: String },
    isAdmin: { type: Boolean, default: false }
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

export const User = mongoose.model<IUserDocument>('User', UserSchema);
