export class TranslationService {
    async translate(text: string, from: string, to: string): Promise<string> {
        // Mock implementation for now
        // In production, this would call Google Translate / DeepL / OpenAI

        if (!text) return '';
        if (from === to) return text;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simple mock logic
        if (to === 'he') {
            return `[HE] ${text}`;
        } else if (to === 'en') {
            return `[EN] ${text}`;
        }

        return `[${to.toUpperCase()}] ${text}`;
    }
}

export const translationService = new TranslationService();
