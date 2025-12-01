import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Language = 'en' | 'he';
type Direction = 'ltr' | 'rtl';

interface ThemeContextType {
    language: Language;
    direction: Direction;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('he'); // Default to Hebrew
    const [direction, setDirection] = useState<Direction>('rtl');

    useEffect(() => {
        const dir = language === 'he' ? 'rtl' : 'ltr';
        setDirection(dir);
        document.documentElement.dir = dir;
        document.documentElement.lang = language;
    }, [language]);

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'he' ? 'en' : 'he'));
    };

    return (
        <ThemeContext.Provider value={{ language, direction, setLanguage, toggleLanguage }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
