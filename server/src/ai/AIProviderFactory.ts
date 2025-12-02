import { AIProvider } from './AIProvider';
import { GeminiProvider } from './GeminiProvider';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export class AIProviderFactory {
    static getProvider(type: 'gemini' = 'gemini'): AIProvider {
        if (type === 'gemini') {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY is not set in environment variables');
            }
            return new GeminiProvider(apiKey);
        }
        throw new Error(`Unknown provider type: ${type}`);
    }
}
