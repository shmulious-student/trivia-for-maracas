import React from 'react';
import { Outlet } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Globe } from 'lucide-react';

const Layout: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen flex flex-col">
            <header style={{
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--bg-secondary)'
            }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Trivia App</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => setLanguage(language === 'he' ? 'en' : 'he')} title="Switch Language">
                        <Globe size={20} />
                        <span style={{ marginLeft: '0.5rem' }}>{language.toUpperCase()}</span>
                    </button>
                </div>
            </header>
            <main style={{ flex: 1, padding: '1rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
