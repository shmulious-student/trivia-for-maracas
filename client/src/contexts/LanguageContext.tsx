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

    const defaultTranslations: Record<string, { en: string; he: string }> = {
        'profile.title': { en: 'Profile Settings', he: 'הגדרות פרופיל' },
        'profile.username': { en: 'Username', he: 'שם משתמש' },
        'profile.changeAvatar': { en: 'Click to change avatar', he: 'לחץ לשינוי תמונה' },
        'profile.avatarUpdated': { en: 'Avatar updated successfully', he: 'התמונה עודכנה בהצלחה' },
        'profile.uploadFailed': { en: 'Failed to upload avatar', he: 'נכשל בהעלאת התמונה' },
        'profile.saved': { en: 'Profile saved successfully', he: 'הפרופיל נשמר בהצלחה' },
        'profile.saveFailed': { en: 'Failed to save profile', he: 'נכשל בשמירת הפרופיל' },
        'common.save': { en: 'Save Changes', he: 'שמור שינויים' },
        'common.saving': { en: 'Saving...', he: 'שומר...' },
        'common.question': { en: 'Question', he: 'שאלה' },
        'common.next': { en: 'Next Question', he: 'לשאלה הבאה' },
        'common.finish': { en: 'Finish Game', he: 'סיים משחק' },
        'Join Game': { en: 'Join Game', he: 'הצטרף למשחק' },
        'Enter your details to start playing': { en: 'Enter your details to start playing', he: 'הכנס פרטים כדי להתחיל' },
        'Username': { en: 'Username', he: 'שם משתמש' },
        'Enter your username': { en: 'Enter your username', he: 'הכנס שם משתמש' },
        'Avatar URL (optional)': { en: 'Avatar URL (optional)', he: 'קישור לתמונה (אופציונלי)' },
        'Start Playing': { en: 'Start Playing', he: 'התחל לשחק' },
        'settings.title': { en: 'Settings', he: 'הגדרות' },
        'settings.account': { en: 'Account Settings', he: 'הגדרות חשבון' },
        'settings.appearance': { en: 'Appearance', he: 'מראה' },
        'settings.darkMode': { en: 'Dark Mode', he: 'מצב כהה' },
        'settings.language': { en: 'Language', he: 'שפה' },
        'auth.logout': { en: 'Logout', he: 'התנתק' },
    };

    const t = (key: string) => {
        const translation = translations[key] || defaultTranslations[key];
        if (!translation) return key;
        return translation[language] || key;
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
