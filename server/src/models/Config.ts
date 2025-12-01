import mongoose, { Schema, Document } from 'mongoose';
import { IGameConfig, IAppConfig } from '@trivia/shared';

export interface IConfigDocument extends Document {
    type: 'game' | 'app';
    data: IGameConfig | IAppConfig;
}

const ConfigSchema = new Schema<IConfigDocument>({
    type: { type: String, required: true, unique: true, enum: ['game', 'app'] },
    data: { type: Schema.Types.Mixed, required: true }
}, {
    timestamps: true
});

export const Config = mongoose.model<IConfigDocument>('Config', ConfigSchema);
