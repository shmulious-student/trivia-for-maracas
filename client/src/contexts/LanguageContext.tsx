import React, { createContext, useContext, useState, useEffect } from 'react';


type Language = 'en' | 'he';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
    language: Language;
    direction: Direction;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string; // Simple translation placeholder
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('he'); // Default to Hebrew
    const direction = language === 'he' ? 'rtl' : 'ltr';

    useEffect(() => {
        document.documentElement.dir = direction;
        document.documentElement.lang = language;
    }, [language, direction]);

    const t = (key: string) => {
        // Placeholder for translation logic
        return key;
    };

    return (
        <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
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
