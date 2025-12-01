import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim()) {
            setError(t('Username is required'));
            return;
        }

        try {
            await login(username, avatarUrl);
            navigate('/');
        } catch {
            setError(t('Login failed. Please try again.'));
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh'
        }}>
            <h1>{t('Join Game')}</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('Enter your username')}
                    style={{
                        padding: '0.8rem',
                        borderRadius: '8px',
                        border: '1px solid var(--text-secondary)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem'
                    }}
                />
                <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder={t('Avatar URL (optional)')}
                    style={{
                        padding: '0.8rem',
                        borderRadius: '8px',
                        border: '1px solid var(--text-secondary)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem'
                    }}
                />
                {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
                <button type="submit" style={{ backgroundColor: 'var(--accent)' }}>
                    {t('Start Playing')}
                </button>
            </form>
        </div>
    );
};

export default Login;
