import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/translate';

export const useTranslation = () => {
    const [translating, setTranslating] = useState(false);

    const translate = async (text: string, from: 'en' | 'he', to: 'en' | 'he'): Promise<string> => {
        if (!text) return '';
        setTranslating(true);
        try {
            const response = await axios.post(API_URL, { text, from, to });
            return response.data.translatedText;
        } catch (error) {
            console.error('Translation failed:', error);
            return text; // Fallback to original
        } finally {
            setTranslating(false);
        }
    };

    return { translate, translating };
};
