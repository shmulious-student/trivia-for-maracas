import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

type Language = 'en' | 'he';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
    language: Language;
    direction: Direction;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const API_URL = 'http://localhost:3000/api/ui-translations/map';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('he');
    const [translations, setTranslations] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const direction = language === 'he' ? 'rtl' : 'ltr';

    useEffect(() => {
        fetchTranslations();
    }, []);

    useEffect(() => {
        document.documentElement.dir = direction;
        document.documentElement.lang = language;
    }, [language, direction]);

    const fetchTranslations = async () => {
        try {
            const response = await axios.get(API_URL);
            setTranslations(response.data);
        } catch (error) {
            console.error('Failed to fetch translations:', error);
        } finally {
            setLoading(false);
        }
    };

    const t = (key: string) => {
        if (!translations[key]) return key;
        return translations[key][language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, direction, setLanguage, t, loading }}>
            {children}
        </LanguageContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
