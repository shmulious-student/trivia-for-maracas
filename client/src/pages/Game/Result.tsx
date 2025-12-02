import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useGameStore } from '../../stores/useGameStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

const Result: React.FC = () => {
    const { t } = useLanguage();
    const { score, questions, resetGame } = useGameStore();
    const { isAuthenticated } = useAuth();
    const maxScore = questions.length * 10;
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isAuthenticated && !submitted && !submitting) {
            submitScore();
        }
    }, [isAuthenticated, submitted, submitting]);

    const submitScore = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_BASE}/leaderboard`,
                { score },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubmitted(true);
        } catch (error) {
            console.error('Failed to submit score:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const percentage = Math.round((score / maxScore) * 100) || 0;

    let message = t('result.goodTry');
    if (percentage >= 80) message = t('result.excellent');
    else if (percentage >= 50) message = t('result.wellDone');

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8 fade-in">
            <div className="text-center">
                <Trophy size={64} className="text-yellow-400 mx-auto mb-4" />
                <h1 className="text-5xl font-bold text-primary mb-2">{t('result.gameOver')}</h1>
                <p className="text-2xl text-text-primary font-medium">{message}</p>
            </div>

            <div className="p-8 text-center rounded-2xl bg-surface border border-border w-full max-w-sm shadow-xl">
                <p className="mb-2 text-xl text-text-secondary">{t('result.yourScore')}</p>
                <div className="text-6xl font-black text-text-primary mb-2">
                    {score} <span className="text-2xl text-text-secondary">/ {maxScore}</span>
                </div>
                {submitted && (
                    <div className="text-green-500 text-sm font-medium bg-green-500/10 py-1 px-3 rounded-full inline-block">
                        {t('result.scoreSaved')}
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={resetGame}
                    className="px-6 py-3 text-lg font-bold text-white transition-colors rounded-lg bg-primary hover:bg-primary-hover flex items-center gap-2"
                >
                    <RefreshCw size={20} />
                    {t('result.playAgain')}
                </button>
                <button
                    onClick={() => window.location.href = '/leaderboard'}
                    className="px-6 py-3 text-lg font-bold text-text-primary transition-colors rounded-lg bg-surface border border-border hover:border-primary flex items-center gap-2"
                >
                    <Trophy size={20} />
                    {t('result.viewLeaderboard')}
                </button>
            </div>
        </div>
    );
};

export default Result;
