import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Globe, Settings as SettingsIcon, User as UserIcon, Trophy, Home } from 'lucide-react';

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
                <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', color: 'inherit' }}>
                    Trivia App
                </Link>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/" title="Home" style={{ color: 'inherit' }}>
                        <Home size={20} />
                    </Link>
                    <Link to="/profile" title="Profile" style={{ color: 'inherit' }}>
                        <UserIcon size={20} />
                    </Link>
                    <Link to="/leaderboard" title="Leaderboard" style={{ color: 'inherit' }}>
                        <Trophy size={20} />
                    </Link>
                    <Link to="/settings" title="Settings" style={{ color: 'inherit' }}>
                        <SettingsIcon size={20} />
                    </Link>
                    <button onClick={toggleTheme} title="Toggle Theme" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => setLanguage(language === 'he' ? 'en' : 'he')} title="Switch Language" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}>
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
