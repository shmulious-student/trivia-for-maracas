import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { type IQuestion } from '@trivia/shared';

// Mock questions for now
const MOCK_QUESTIONS: IQuestion[] = [
    {
        id: '1',
        text: { en: 'What is the capital of France?', he: 'מהי בירת צרפת?' },
        options: [
            { text: { en: 'London', he: 'לונדון' } },
            { text: { en: 'Paris', he: 'פריז' } },
            { text: { en: 'Berlin', he: 'ברלין' } },
            { text: { en: 'Madrid', he: 'מדריד' } }
        ],
        correctAnswerIndex: 1,
        type: 'multiple-choice',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '2',
        text: { en: 'Which planet is known as the Red Planet?', he: 'איזה כוכב לכת ידוע ככוכב האדום?' },
        options: [
            { text: { en: 'Mars', he: 'מאדים' } },
            { text: { en: 'Venus', he: 'נוגה' } },
            { text: { en: 'Jupiter', he: 'צדק' } },
            { text: { en: 'Saturn', he: 'שבתאי' } }
        ],
        correctAnswerIndex: 0,
        type: 'multiple-choice',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

const Lobby: React.FC = () => {
    const startGame = useGameStore((state) => state.startGame);

    const handleStart = () => {
        startGame(MOCK_QUESTIONS);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
            <h1 className="text-4xl font-bold text-primary">Lobby</h1>
            <p className="text-lg text-text-secondary">Waiting for players...</p>

            <button
                onClick={handleStart}
                className="px-8 py-3 text-xl font-bold text-white transition-colors rounded-lg bg-primary hover:bg-primary-hover"
            >
                Start Game
            </button>
        </div>
    );
};

export default Lobby;
