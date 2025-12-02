import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/useGameStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import type { ISubject, IQuestion } from '@trivia/shared';
import { Play, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SubjectCard } from '../../components/SubjectCard';

const API_BASE = 'http://localhost:3000/api';

const Lobby: React.FC = () => {
    const { t, language } = useLanguage();
    const { user, updateUser } = useAuth();
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

    const toggleFavorite = async (e: React.MouseEvent, subjectId: string) => {
        e.stopPropagation();
        if (!user) return;

        const currentFavorites = user.preferences?.favoriteSubjects || [];
        const isFavorite = currentFavorites.includes(subjectId);

        let newFavorites;
        if (isFavorite) {
            newFavorites = currentFavorites.filter(id => id !== subjectId);
        } else {
            newFavorites = [...currentFavorites, subjectId];
        }

        const updatedUser = {
            ...user,
            preferences: {
                ...user.preferences,
                favoriteSubjects: newFavorites
            }
        };

        try {
            await axios.put(`${API_BASE}/users/profile`, {
                preferences: updatedUser.preferences
            });
            updateUser(updatedUser);
        } catch (error) {
            console.error('Failed to update favorites:', error);
        }
    };

    const sortedSubjects = React.useMemo(() => {
        let displaySubjects = [...subjects];
        const favorites = user?.preferences?.favoriteSubjects || [];

        // Sort: Favorites first, then alphabetical
        displaySubjects.sort((a, b) => {
            const aFav = favorites.includes(a.id);
            const bFav = favorites.includes(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return a.name[language].localeCompare(b.name[language]);
        });

        // Add "Favorite subjects mix" if applicable
        if (favorites.length >= 2) {
            const mixSubject: ISubject = {
                id: 'favorites-mix',
                name: {
                    en: 'Favorite Subjects Mix',
                    he: 'מיקס נושאים מועדפים'
                },
                questionCount: subjects
                    .filter(s => favorites.includes(s.id))
                    .reduce((acc, curr) => acc + (curr.questionCount || 0), 0)
            };
            displaySubjects = [mixSubject, ...displaySubjects];
        }

        return displaySubjects;
    }, [subjects, user, language]);

    const handleStart = async () => {
        if (!selectedSubject) return;

        try {
            setStarting(true);
            const limit = user?.preferences?.questionsPerTournament || 10;

            let querySubjectId = selectedSubject;

            // Handle "Favorite subjects mix"
            if (selectedSubject === 'favorites-mix') {
                querySubjectId = (user?.preferences?.favoriteSubjects || []).join(',');
            }

            const res = await axios.get(`${API_BASE}/questions?subjectId=${querySubjectId}&limit=${limit}`);
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
        <div className="flex flex-col h-full max-w-4xl mx-auto px-4 py-6 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2 shrink-0"
            >
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-purple-400">
                    {t('lobby.title')}
                </h1>
                <p className="text-lg text-text-secondary max-w-lg mx-auto">
                    {t('lobby.subtitle')}
                </p>
            </motion.div>

            <div className="flex-1 min-h-0 flex flex-col space-y-4">
                <div className="flex items-center gap-3 text-text-primary shrink-0">
                    <div className="p-2 bg-accent-primary/20 rounded-lg">
                        <BookOpen size={24} className="text-accent-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">
                        {t('lobby.selectSubject')}
                    </h2>
                </div>

                <div className="h-[21rem] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                        {sortedSubjects.map((subject, index) => (
                            <SubjectCard
                                key={subject.id}
                                subject={subject}
                                index={index}
                                isSelected={selectedSubject === subject.id}
                                onSelect={() => setSelectedSubject(subject.id)}
                                isFavorite={user?.preferences?.favoriteSubjects?.includes(subject.id) || false}
                                onToggleFavorite={(e) => toggleFavorite(e, subject.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mx-auto shrink-0 pt-2"
            >
                <Button
                    onClick={handleStart}
                    disabled={!selectedSubject || starting}
                    size="lg"
                    className="w-full text-xl py-6 shadow-xl"
                    isLoading={starting}
                >
                    {!starting && (
                        selectedSubject === 'favorites-mix'
                            ? <Sparkles size={24} className="me-2" />
                            : <Play size={24} fill="currentColor" className="me-2" />
                    )}
                    {t('lobby.startGame')}
                </Button>
            </motion.div>
        </div>
    );
};

export default Lobby;

