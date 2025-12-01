import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h1>{t('Welcome to Trivia')}</h1>
            <p>{t('Test your knowledge and compete with others!')}</p>
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button style={{ fontSize: '1.2rem', padding: '1rem' }}>
                    {t('Start Game')}
                </button>
                <button style={{ fontSize: '1.2rem', padding: '1rem', backgroundColor: 'transparent', border: '1px solid var(--text-secondary)' }}>
                    {t('Leaderboard')}
                </button>
            </div>
        </div>
    );
};

export default Home;
