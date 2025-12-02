import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useGameStore } from '../../stores/useGameStore';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ISubject, IQuestion } from '@trivia/shared';
import { Play, BookOpen } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

const Lobby: React.FC = () => {
    const { t, language } = useLanguage();
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

    const handleStart = async () => {
        if (!selectedSubject) return;

        try {
            setStarting(true);
            const res = await axios.get(`${API_BASE}/questions?subjectId=${selectedSubject}`);
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

    if (loading) return <div className="text-center p-8">{t('common.loading')}</div>;

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8 fade-in">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-2">{t('lobby.title')}</h1>
                <p className="text-lg text-text-secondary">{t('lobby.subtitle')}</p>
            </div>

            <div className="w-full max-w-md space-y-4">
                <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                    <BookOpen size={20} />
                    {t('lobby.selectSubject')}
                </h2>

                <div className="grid grid-cols-1 gap-3">
                    {subjects.map((subject) => (
                        <button
                            key={subject.id}
                            onClick={() => setSelectedSubject(subject.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedSubject === subject.id
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-surface hover:border-primary/50'
                                }`}
                        >
                            <div className="font-bold">{subject.name[language]}</div>
                            {subject.questionCount !== undefined && (
                                <div className="text-xs text-text-secondary">
                                    {subject.questionCount} {t('common.questions')}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleStart}
                disabled={!selectedSubject || starting}
                className={`px-8 py-3 text-xl font-bold text-white transition-all rounded-lg flex items-center gap-2 ${!selectedSubject || starting
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-primary hover:bg-primary-hover shadow-lg hover:shadow-primary/20'
                    }`}
            >
                {starting ? (
                    <span>{t('common.loading')}...</span>
                ) : (
                    <>
                        <Play size={24} fill="currentColor" />
                        {t('lobby.startGame')}
                    </>
                )}
            </button>
        </div>
    );
};

export default Lobby;
