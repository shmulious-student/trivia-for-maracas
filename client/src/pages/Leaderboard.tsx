import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal } from 'lucide-react';
import type { ILeaderboardEntry } from '@trivia/shared';

const API_BASE = 'http://localhost:3000/api';

const Leaderboard: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<ILeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get(`${API_BASE}/leaderboard`);
            setLeaderboard(res.data);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="text-yellow-400" size={24} />;
            case 1: return <Medal className="text-gray-400" size={24} />;
            case 2: return <Medal className="text-amber-600" size={24} />;
            default: return <span className="text-lg font-bold w-6 text-center">{index + 1}</span>;
        }
    };

    if (loading) return <div className="text-center p-8">{t('common.loading')}</div>;

    return (
        <div className="container fade-in max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-8 gap-3">
                <Trophy size={32} className="text-primary" />
                <h1 className="text-3xl font-bold text-center">{t('leaderboard.title')}</h1>
            </div>

            <div className="card overflow-hidden">
                {leaderboard.length === 0 ? (
                    <p className="text-center text-text-secondary p-4">{t('leaderboard.empty')}</p>
                ) : (
                    <div className="divide-y divide-border">
                        {leaderboard.map((entry, index) => {
                            const isCurrentUser = user && entry.userId === user.id;
                            return (
                                <div
                                    key={index}
                                    className={`flex items-center p-4 ${isCurrentUser ? 'bg-primary/10' : ''}`}
                                >
                                    <div className="flex-shrink-0 mr-4 w-8 flex justify-center">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="flex-grow">
                                        <div className={`font-bold ${isCurrentUser ? 'text-primary' : ''}`}>
                                            {entry.username}
                                        </div>
                                        <div className="text-xs text-text-secondary">
                                            {new Date(entry.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-xl font-mono font-bold text-accent-primary">
                                        {entry.score}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
