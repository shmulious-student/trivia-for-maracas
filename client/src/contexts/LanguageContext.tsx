import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import enTranslations from '../locales/en.json';
import heTranslations from '../locales/he.json';
import { API_BASE } from '../config/api';

type Language = 'en' | 'he';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
    language: Language;
    direction: Direction;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved === 'en' || saved === 'he') ? saved : 'he';
    });
    const [translations, setTranslations] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const direction = language === 'he' ? 'rtl' : 'ltr';

    useEffect(() => {
        fetchTranslations();
    }, []);

    // Sync with user preferences on login
    useEffect(() => {
        if (user?.preferences?.language && user.preferences.language !== language) {
            setLanguageState(user.preferences.language);
            localStorage.setItem('language', user.preferences.language);
        }
    }, [user]);

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);

        if (user) {
            try {
                // Optimistically update user context
                updateUser({
                    ...user,
                    preferences: {
                        ...user.preferences,
                        language: lang
                    }
                });

                // Persist to backend
                const token = localStorage.getItem('token');
                await axios.put(`${API_BASE}/users/profile`, {
                    preferences: {
                        ...user.preferences,
                        language: lang
                    }
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error('Failed to save language preference:', error);
            }
        }
    };

    useEffect(() => {
        document.documentElement.dir = direction;
        document.documentElement.lang = language;
    }, [language, direction]);

    const fetchTranslations = async () => {
        try {
            const response = await axios.get(`${API_BASE}/ui-translations/map`);
            setTranslations(response.data);
        } catch (error) {
            console.error('Failed to fetch translations:', error);
        } finally {
            setLoading(false);
        }
    };

    const localTranslations: Record<Language, Record<string, string>> = {
        en: enTranslations,
        he: heTranslations
    };

    const t = (key: string, params?: Record<string, string | number>) => {
        let text = key;

        // 1. Try API translations (overrides)
        if (translations[key] && translations[key][language]) {
            text = translations[key][language];
        }
        // 2. Try local JSON files
        else {
            const local = localTranslations[language] as Record<string, string>;
            if (local && local[key]) {
                text = local[key];
            }
        }

        // 3. Interpolation
        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                text = text.replace(`{${paramKey}}`, String(paramValue));
            });
        }

        return text;
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
