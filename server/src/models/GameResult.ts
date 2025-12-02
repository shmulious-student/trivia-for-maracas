import mongoose, { Schema, Document } from 'mongoose';
import { ILeaderboardEntry } from '@trivia/shared';

export interface IGameResultDocument extends Omit<ILeaderboardEntry, 'id'>, Document { }

const GameResultSchema = new Schema<IGameResultDocument>({
    userId: { type: String, required: true, ref: 'User' },
    username: { type: String, required: true },
    score: { type: Number, required: true },
    subjectId: { type: String, ref: 'Subject' },
    gameId: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now }
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

// Index for efficient leaderboard queries
GameResultSchema.index({ score: -1, date: 1 });

export const GameResult = mongoose.model<IGameResultDocument>('GameResult', GameResultSchema);
