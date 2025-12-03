import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '@trivia/shared';

export interface IUserDocument extends Omit<IUser, 'id'>, Document { }

const UserSchema = new Schema<IUserDocument>({
    username: { type: String, required: true, unique: true },
    password: { type: String }, // Only for admins
    avatarUrl: { type: String },
    isAdmin: { type: Boolean, default: false },
    preferences: {
        questionsPerTournament: { type: Number, min: 5, max: 30, default: 20 },
        gameTimer: { type: Number, min: 5, max: 60, default: 30 },
        isTimerEnabled: { type: Boolean, default: false },
        favoriteSubjects: [{ type: String }],
        gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
        language: { type: String, enum: ['en', 'he'], default: 'he' }
    }
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

// Text index for efficient search
UserSchema.index({ username: 'text' });

export const User = mongoose.model<IUserDocument>('User', UserSchema);
