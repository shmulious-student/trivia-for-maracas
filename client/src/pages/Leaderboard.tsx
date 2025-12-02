import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Crown } from 'lucide-react';
import type { ILeaderboardEntry } from '@trivia/shared';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

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

    const getRankStyles = (index: number) => {
        const base = "glass-panel";
        switch (index) {
            case 0: return cn(base, "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]");
            case 1: return cn(base, "bg-gradient-to-r from-slate-400/20 to-slate-500/20 border-slate-400/50");
            case 2: return cn(base, "bg-gradient-to-r from-amber-700/20 to-amber-800/20 border-amber-700/50");
            default: return cn(base, "opacity-80 hover:opacity-100");
        }
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="text-yellow-400 drop-shadow-glow" size={32} />;
            case 1: return <Medal className="text-gray-300" size={28} />;
            case 2: return <Medal className="text-amber-600" size={28} />;
            default: return <span className="text-xl font-bold text-text-muted w-8 text-center">{index + 1}</span>;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
        </div>
    );

    return (
        <div className="container max-w-2xl mx-auto py-8 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2"
            >
                <div className="inline-flex p-3 rounded-full bg-accent-primary/10 mb-4">
                    <Trophy size={40} className="text-accent-primary" />
                </div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-purple-400">
                    {t('leaderboard.title')}
                </h1>
            </motion.div>

            <Card className="overflow-hidden border-none bg-transparent shadow-none">
                {leaderboard.length === 0 ? (
                    <div className="text-center p-8 bg-bg-secondary/50 rounded-xl border border-white/10">
                        <p className="text-text-secondary">{t('leaderboard.empty')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.map((entry, index) => {
                            const isCurrentUser = user && entry.userId === user.id;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        "flex items-center p-4 rounded-xl transition-all duration-300",
                                        getRankStyles(index),
                                        isCurrentUser && "ring-2 ring-accent-primary shadow-glow transform scale-[1.02] z-10"
                                    )}
                                >
                                    <div className="flex-shrink-0 w-12 flex justify-center items-center">
                                        {getRankIcon(index)}
                                    </div>

                                    <div className="flex-grow px-4">
                                        <div className={cn(
                                            "font-bold text-lg",
                                            isCurrentUser ? "text-accent-primary" : "text-text-primary",
                                            index === 0 && "text-yellow-400"
                                        )}>
                                            {entry.username}
                                        </div>
                                        <div className="text-xs text-text-muted">
                                            {new Date(entry.date).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="text-2xl font-mono font-bold text-text-primary tabular-nums">
                                        {entry.score.toLocaleString()}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Leaderboard;

