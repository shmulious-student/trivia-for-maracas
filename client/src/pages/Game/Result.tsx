import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/useGameStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSoundContext } from '../../contexts/SoundContext';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, RefreshCw, AlertTriangle } from 'lucide-react';
import posthog from '../../lib/posthog';
import { ReportModal } from '../../components/Game/ReportModal';
import { API_BASE } from '../../config/api';
import { BonusPointsModal } from '../../components/BonusPointsModal';
import { CinemaEasterEgg } from '../../components/EasterEggs/CinemaEasterEgg';



const Result: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { playSound } = useSoundContext();
    const { score, questions, resetGame, isResultSubmitted, setResultSubmitted, gameId, isSubmitting, setSubmitting } = useGameStore();
    const { isAuthenticated, user, updateUser, refreshUser } = useAuth();

    useEffect(() => {
        refreshUser();
    }, []);

    const maxScore = questions.length * 10;

    // useEffect(() => {
    //     return () => {
    //         resetGame();
    //     };
    // }, []);

    useEffect(() => {
        playSound('gameOver');
        if (isAuthenticated && !isResultSubmitted && !isSubmitting && gameId) {
            submitScore();
        }
    }, [isAuthenticated, isResultSubmitted, isSubmitting, gameId]);

    const submitScore = async () => {
        if (isSubmitting || isResultSubmitted) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            const subjectId = questions.length > 0 ? questions[0].subjectId : undefined;
            const res = await axios.post(
                `${API_BASE}/leaderboard`,
                { score, subjectId, gameId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.isNewRecord) {
                playSound('newRecord');
            }

            // Track Event
            posthog.capture('game_completed', {
                score,
                max_score: maxScore,
                username: user?.username,
                game_id: gameId
            });

            setResultSubmitted(true);
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

    const [showReportModal, setShowReportModal] = useState(false);
    const [showBonusModal, setShowBonusModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const handleAction = (action: () => void) => {
        const hasSeenModal = user?.preferences?.hasSeenBonusModal;
        const timerEnabled = user?.preferences?.isTimerEnabled ?? true; // Default to true if undefined

        if (!timerEnabled && !hasSeenModal) {
            setPendingAction(() => action);
            setShowBonusModal(true);
        } else {
            action();
        }
    };

    const handleBonusSave = async (enableTimer: boolean, timePerQuestion: number) => {
        if (!user) return;

        const updatedPreferences = {
            ...user.preferences,
            isTimerEnabled: enableTimer,
            gameTimer: timePerQuestion,
            hasSeenBonusModal: true
        };

        try {
            await axios.put(`${API_BASE}/users/profile`, {
                preferences: updatedPreferences
            });

            updateUser({
                ...user,
                preferences: updatedPreferences
            });
        } catch (error) {
            console.error('Failed to update preferences:', error);
        }

        setShowBonusModal(false);
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    const handleBonusClose = async () => {
        if (user) {
            const updatedPreferences = {
                ...user.preferences,
                hasSeenBonusModal: true
            };

            try {
                await axios.put(`${API_BASE}/users/profile`, {
                    preferences: updatedPreferences
                });

                updateUser({
                    ...user,
                    preferences: updatedPreferences
                });
            } catch (error) {
                console.error('Failed to update preferences:', error);
            }
        }

        setShowBonusModal(false);
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };


    const [showEasterEgg, setShowEasterEgg] = useState(false);

    useEffect(() => {
        if (score > 200 && user?.isEaster) {
            const timer = setTimeout(() => {
                setShowEasterEgg(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [score, user]);

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8 fade-in">
            {showEasterEgg && <CinemaEasterEgg onComplete={() => setShowEasterEgg(false)} />}
            <div className="text-center mt-12">

                <Trophy size={64} className="text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-purple-400 mb-2">
                    {t('result.gameOver')}
                </h1>
                <p className="text-2xl text-text-primary font-medium">{message}</p>
            </div>

            <div className="p-8 text-center rounded-2xl bg-surface border border-border w-full max-w-sm shadow-xl">
                <p className="mb-2 text-xl text-text-secondary">{t('result.yourScore')}</p>
                <div className="text-6xl font-black text-text-primary mb-2">
                    {score} <span className="text-2xl text-text-secondary">/ {maxScore}</span>
                </div>
                {isResultSubmitted && (
                    <div className="text-green-500 text-sm font-medium bg-green-500/10 py-1 px-3 rounded-full inline-block">
                        {t('result.scoreSaved')}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md px-4">
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => handleAction(resetGame)}
                        className="px-6 py-3 text-lg font-bold text-white transition-colors rounded-lg bg-primary hover:bg-primary-hover flex items-center gap-2"
                    >

                        <RefreshCw size={20} />
                        {t('result.playAgain')}
                    </button>
                    <button
                        onClick={() => handleAction(() => navigate('/leaderboard'))}
                        className="px-6 py-3 text-lg font-bold text-text-primary transition-colors rounded-lg bg-surface border border-border hover:border-primary flex items-center gap-2"
                    >

                        <Trophy size={20} />
                        {t('result.viewLeaderboard')}
                    </button>
                </div>

                <button
                    onClick={() => setShowReportModal(true)}
                    className="w-full py-2 text-sm font-medium text-text-secondary hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                >
                    <AlertTriangle size={16} />
                    {t('report.buttonText')}
                </button>
            </div>

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                questions={questions}
            />

            <BonusPointsModal
                isOpen={showBonusModal}
                onClose={handleBonusClose}
                onSave={handleBonusSave}
            />

        </div>
    );
};

export default Result;
