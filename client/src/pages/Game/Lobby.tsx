import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/useGameStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import type { ISubject, IQuestion } from '@trivia/shared';
import { Play, BookOpen, Trophy, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { Tooltip } from '../../components/ui/Tooltip';

const API_BASE = 'http://localhost:3000/api';

const Lobby: React.FC = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const startGame = useGameStore((state) => state.startGame);
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(`${API_BASE}/subjects`);
            setSubjects(res.data);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortedSubjects = React.useMemo(() => {
        if (!user?.preferences?.favoriteSubjects || user.preferences.favoriteSubjects.length === 0) {
            return subjects;
        }
        return [...subjects].sort((a, b) => {
            const aFav = user.preferences!.favoriteSubjects!.includes(a.id);
            const bFav = user.preferences!.favoriteSubjects!.includes(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return 0;
        });
    }, [subjects, user]);

    const handleStart = async () => {
        if (!selectedSubject) return;

        try {
            setStarting(true);
            const limit = user?.preferences?.questionsPerTournament || 10;
            const res = await axios.get(`${API_BASE}/questions?subjectId=${selectedSubject}&limit=${limit}`);
            const questions: IQuestion[] = res.data;

            if (questions.length === 0) {
                alert(t('lobby.noQuestions'));
                return;
            }

            startGame(questions);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            alert(t('lobby.startFailed'));
        } finally {
            setStarting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-4 py-8 space-y-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-purple-400">
                    {t('lobby.title')}
                </h1>
                <p className="text-xl text-text-secondary max-w-lg mx-auto">
                    {t('lobby.subtitle')}
                </p>
            </motion.div>

            <div className="w-full space-y-6">
                <div className="flex items-center gap-3 text-text-primary mb-6">
                    <div className="p-2 bg-accent-primary/20 rounded-lg">
                        <BookOpen size={24} className="text-accent-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">
                        {t('lobby.selectSubject')}
                    </h2>
                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedSubjects.map((subject, index) => (
                        <motion.button
                            key={subject.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedSubject(subject.id)}
                            className={cn(
                                "group relative p-6 rounded-xl border transition-all duration-300 text-start overflow-hidden",
                                selectedSubject === subject.id
                                    ? "bg-accent-primary/10 border-accent-primary shadow-glow"
                                    : "glass-panel hover:border-white/20 hover:bg-bg-secondary/80"
                            )}
                        >
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <Tooltip content={subject.name[language]} position="top">
                                        <h3 className={cn(
                                            "text-xl font-bold mb-2 transition-colors truncate max-w-[200px]",
                                            selectedSubject === subject.id ? "text-accent-primary" : "text-text-primary group-hover:text-white"
                                        )}>
                                            {subject.name[language]}
                                        </h3>
                                    </Tooltip>
                                    {subject.questionCount !== undefined && (
                                        <span className="text-sm text-text-muted flex items-center gap-1">
                                            <Star size={14} />
                                            {subject.questionCount} {t('common.questions')}
                                        </span>
                                    )}
                                </div>
                                {selectedSubject === subject.id && (
                                    <motion.div
                                        layoutId="selected-indicator"
                                        className="bg-accent-primary text-white p-1 rounded-full"
                                    >
                                        <Trophy size={16} />
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-md"
            >
                <Button
                    onClick={handleStart}
                    disabled={!selectedSubject || starting}
                    size="lg"
                    className="w-full text-xl py-6 shadow-xl"
                    isLoading={starting}
                >
                    {!starting && <Play size={24} fill="currentColor" className="me-2" />}
                    {t('lobby.startGame')}
                </Button>
            </motion.div>
        </div>
    );
};

export default Lobby;

