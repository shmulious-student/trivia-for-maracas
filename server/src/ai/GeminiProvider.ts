import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './AIProvider';
import { UsageTracker } from './UsageTracker';

export class GeminiProvider implements AIProvider {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private usageTracker: UsageTracker;

    constructor(apiKey: string, modelName: string = 'gemini-2.0-flash') {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        this.usageTracker = new UsageTracker();
    }

    async listModels(): Promise<string[]> {
        try {
            // Use REST API to list models since SDK doesn't expose listModels
            const apiKey = process.env.GEMINI_API_KEY;
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as any;
            const geminiModels = data.models
                .filter((model: any) => {
                    // Only models with generateContent support
                    return model.supportedGenerationMethods?.includes('generateContent');
                })
                .filter((model: any) => model.name.includes('gemini-'))
                .map((model: any) => ({
                    name: model.name.replace('models/', ''),
                    displayName: model.displayName,
                    inputLimit: model.inputTokenLimit,
                    outputLimit: model.outputTokenLimit
                }))
                .filter((model: any) => model.name.startsWith('gemini-'))
                .filter((model: any) => {
                    // Only include flash, flash-lite, or pro models
                    const lowerName = model.name.toLowerCase();
                    return lowerName.includes('flash') || lowerName.includes('pro');
                })
                .filter((model: any) => {
                    // Exclude specialized models (embedding, robotics, computer-use, tts, image, thinking)
                    const lowerName = model.name.toLowerCase();
                    return !lowerName.includes('embedding') &&
                        !lowerName.includes('robotics') &&
                        !lowerName.includes('computer-use') &&
                        !lowerName.includes('tts') &&
                        !lowerName.includes('image') &&
                        !lowerName.includes('thinking');
                })
                .filter((model: any) => {
                    // Exclude experimental and preview models
                    const lowerName = model.name.toLowerCase();
                    return !lowerName.includes('-exp') &&
                        !lowerName.includes('preview');
                })
                .map((model: any) => {
                    // Format: "model-name (in: 1M, out: 64K)"
                    const inTokens = model.inputLimit ? this.formatTokenLimit(model.inputLimit) : '?';
                    const outTokens = model.outputLimit ? this.formatTokenLimit(model.outputLimit) : '?';
                    return `${model.name} (in: ${inTokens}, out: ${outTokens})`;
                });

            return geminiModels.length > 0 ? geminiModels : ['gemini-2.0-flash'];
        } catch (error) {
            console.error('Failed to fetch models, using default:', error);
            return ['gemini-2.0-flash'];
        }
    }

    private formatTokenLimit(tokens: number): string {
        if (tokens >= 1000000) {
            return `${(tokens / 1000000).toFixed(1)}M`;
        } else if (tokens >= 1000) {
            return `${(tokens / 1000).toFixed(0)}K`;
        }
        return tokens.toString();
    }

    setModel(modelName: string) {
        // Extract model name from formatted string "model-name (in: X, out: Y)"
        const cleanName = modelName.split(' (')[0];
        this.model = this.genAI.getGenerativeModel({ model: cleanName });
    }

    getUsageTracker(): UsageTracker {
        return this.usageTracker;
    }

    async generateQuestions(topic: string, count: number, lang: string, sources?: string[]): Promise<any[]> {
        if (process.env.AI_DRY_RUN === 'true') {
            console.warn('[GeminiProvider] Dry Run enabled. Returning empty mock data to prevent API usage.');
            return [];
        }

        // Track usage and check limits
        const modelName = this.model._modelParams?.model || 'unknown';
        this.usageTracker.logRequest(modelName, 'generate');
        this.usageTracker.checkLimits();

        let sourcesSection = '';
        if (sources && sources.length > 0) {
            sourcesSection = `\n\nFACTUAL SOURCES (base questions STRICTLY on these sources ONLY):
${sources.map((source, i) => `${i + 1}. ${source}`).join('\n')}

CRITICAL INSTRUCTIONS FOR SOURCES:
- All questions MUST be based on factual information from the provided sources above
- No abstract, interpretable, or philosophical questions
- Only plot details, character names, actors, events, dates, and other concrete facts
- Do NOT create questions based on general knowledge or assumptions`;
        }

        const prompt = `Generate ${count} trivia questions about "${topic}".${sourcesSection}
        Return ONLY a JSON array with objects containing:
        - text: object with "en" and "he" (Hebrew translation)
        - options: array of objects { text: { "en": "...", "he": "..." } } (4 options)
        - correctAnswerIndex: number (0-3)
        
        IMPORTANT: Before generating, consider existing questions in this subject area to avoid creating duplicates or very similar questions.
        Ensure the Hebrew translation is accurate and natural.
        
        Example format:
        [
          {
            "text": { "en": "What is...", "he": "מה הוא..." },
            "options": [
              { "text": { "en": "Option 1", "he": "אפשרות 1" } },
              { "text": { "en": "Option 2", "he": "אפשרות 2" } },
              { "text": { "en": "Option 3", "he": "אפשרות 3" } },
              { "text": { "en": "Option 4", "he": "אפשרות 4" } }
            ],
            "correctAnswerIndex": 0
          }
        ]`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            // Clean up markdown code blocks if present
            const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse Gemini response:', text);
            throw new Error('Failed to generate valid JSON from AI response');
        }
    }

    async translate(text: string, targetLang: string): Promise<string> {
        if (process.env.AI_DRY_RUN === 'true') {
            console.warn('[GeminiProvider] Dry Run enabled. Returning mock translation.');
            return `[HE] ${text}`;
        }

        // Track usage and check limits
        const modelName = this.model._modelParams?.model || 'unknown';
        this.usageTracker.logRequest(modelName, 'translate');
        this.usageTracker.checkLimits();
        const prompt = `Translate the following text to ${targetLang}. Return ONLY the translated text, no explanations.
        
        Text: "${text}"`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }

    async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
        if (process.env.AI_DRY_RUN === 'true') {
            console.warn('[GeminiProvider] Dry Run enabled. Returning mock translations.');
            return texts.map(t => `[HE] ${t}`);
        }

        // Track usage and check limits
        const modelName = this.model._modelParams?.model || 'unknown';
        this.usageTracker.logRequest(modelName, 'translateBatch');
        this.usageTracker.checkLimits();

        const prompt = `Translate the following array of texts to ${targetLang}. 
        Return ONLY a JSON array of strings in the same order.
        
        Input: ${JSON.stringify(texts)}`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse Gemini batch translation response:', text);
            // Fallback to individual translation if batch fails (though inefficient, it's safer than crashing)
            // Or throw error. Let's throw for now to be consistent with optimization goal.
            throw new Error('Failed to generate valid JSON from AI batch translation');
        }
    }
}
