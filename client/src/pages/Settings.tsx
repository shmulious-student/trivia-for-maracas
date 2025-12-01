import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    return (
        <div style={{ padding: '1rem' }}>
            <h1>{t('Settings')}</h1>

            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user?.avatarUrl && (
                    <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                )}
                <div>
                    <h2 style={{ margin: 0 }}>{user?.username}</h2>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <h3>{t('Appearance')}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span>{t('Dark Mode')}</span>
                        <button onClick={toggleTheme}>
                            {theme === 'dark' ? t('On') : t('Off')}
                        </button>
                    </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <h3>{t('Language')}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                            onClick={() => setLanguage('he')}
                            style={{
                                backgroundColor: language === 'he' ? 'var(--accent)' : 'transparent',
                                border: '1px solid var(--accent)'
                            }}
                        >
                            עברית
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            style={{
                                backgroundColor: language === 'en' ? 'var(--accent)' : 'transparent',
                                border: '1px solid var(--accent)'
                            }}
                        >
                            English
                        </button>
                    </div>
                </div>

                <button
                    onClick={logout}
                    style={{
                        marginTop: '1rem',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--danger)',
                        color: 'var(--danger)'
                    }}
                >
                    {t('Logout')}
                </button>
            </div>
        </div>
    );
};

export default Settings;
