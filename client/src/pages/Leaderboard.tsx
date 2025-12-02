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
    const { t, language } = useLanguage();
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
        const base = "glass-panel transition-all duration-300 border-l-4";
        switch (index) {
            case 0: return cn(base, "bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]");
            case 1: return cn(base, "bg-gradient-to-r from-slate-400/10 to-slate-500/5 border-slate-400");
            case 2: return cn(base, "bg-gradient-to-r from-amber-700/10 to-amber-800/5 border-amber-700");
            default: return cn(base, "border-transparent hover:bg-white/5");
        }
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="text-yellow-400 drop-shadow-glow animate-pulse-slow" size={32} />;
            case 1: return <Medal className="text-slate-300" size={28} />;
            case 2: return <Medal className="text-amber-600" size={28} />;
            default: return <span className="text-xl font-bold text-text-muted/50 w-8 text-center font-mono">#{index + 1}</span>;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
        </div>
    );

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 mb-12"
            >
                <div className="inline-flex p-4 rounded-full bg-accent-primary/10 mb-2 ring-1 ring-accent-primary/20 shadow-lg shadow-accent-primary/10">
                    <Trophy size={48} className="text-accent-primary" />
                </div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-purple-400 to-accent-secondary tracking-tight">
                    {t('leaderboard.title')}
                </h1>
                <p className="text-text-muted text-lg max-w-2xl mx-auto">
                    Top players and their achievements
                </p>
            </motion.div>

            <Card className="overflow-hidden border-none bg-bg-secondary/30 backdrop-blur-sm shadow-xl ring-1 ring-white/5">
                {leaderboard.length === 0 ? (
                    <div className="text-center p-12">
                        <p className="text-text-secondary text-xl">{t('leaderboard.empty')}</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {/* Header Row */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-black/20 text-xs font-bold text-text-muted uppercase tracking-wider border-b border-white/5">
                            <div className="col-span-2 text-center">Rank</div>
                            <div className="col-span-7">Player</div>
                            <div className="col-span-3 text-right">Score</div>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-white/5 pb-6">
                            {leaderboard.map((entry, index) => {
                                const isCurrentUser = user && entry.userId === user.id;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "grid grid-cols-12 gap-4 items-center px-6 py-4 transition-all duration-200",
                                            getRankStyles(index),
                                            isCurrentUser && "bg-accent-primary/5 ring-1 ring-accent-primary/30 z-10"
                                        )}
                                    >
                                        {/* Rank Column */}
                                        <div className="col-span-2 flex justify-center items-center">
                                            {getRankIcon(index)}
                                        </div>

                                        {/* Player Column */}
                                        <div className="col-span-7 flex items-center gap-4">
                                            <div className="relative">
                                                {entry.avatarUrl ? (
                                                    <img
                                                        src={`http://localhost:3000${entry.avatarUrl}`}
                                                        alt={entry.username}
                                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center ring-2 ring-white/10">
                                                        <span className="text-xl font-bold text-text-secondary">
                                                            {entry.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                {index < 3 && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg text-[10px] font-bold text-black border border-white/20">
                                                        {index + 1}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col">
                                                <div className={cn(
                                                    "font-bold text-lg leading-tight",
                                                    isCurrentUser ? "text-accent-primary" : "text-text-primary",
                                                    index === 0 && "text-yellow-400"
                                                )}>
                                                    {entry.username}
                                                    {isCurrentUser && <span className="ml-2 text-xs bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded-full">You</span>}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-text-muted mt-0.5">
                                                    {entry.subjectName && (
                                                        <>
                                                            <span className="text-accent-secondary">{entry.subjectName[language]}</span>
                                                            <span className="text-white/10">•</span>
                                                        </>
                                                    )}
                                                    <span>{new Date(entry.date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Score Column */}
                                        <div className="col-span-3 text-right">
                                            <div className="text-2xl font-mono font-bold text-text-primary tracking-tight">
                                                {entry.score.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-text-muted uppercase tracking-wider font-medium">Points</div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Leaderboard;

