import { Question } from '../models/Question';

export interface AIProvider {
    listModels(): Promise<string[]>;
    setModel(modelName: string): void;
    generateQuestions(topic: string, count: number, lang: string, sources?: string[]): Promise<any[]>;
    translate(text: string, targetLang: string): Promise<string>;
    translateBatch(texts: string[], targetLang: string): Promise<string[]>;
}
