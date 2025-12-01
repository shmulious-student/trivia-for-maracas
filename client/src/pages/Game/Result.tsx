import React from 'react';
import { useGameStore } from '../../stores/useGameStore';

const Result: React.FC = () => {
    const { score, questions, resetGame } = useGameStore();
    const maxScore = questions.length * 10;

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
            <h1 className="text-5xl font-bold text-primary">Game Over!</h1>

            <div className="p-8 text-center rounded-2xl bg-surface border border-border">
                <p className="mb-2 text-xl text-text-secondary">Your Score</p>
                <div className="text-6xl font-black text-text-primary">
                    {score} <span className="text-2xl text-text-secondary">/ {maxScore}</span>
                </div>
            </div>

            <button
                onClick={resetGame}
                className="px-8 py-3 text-xl font-bold text-white transition-colors rounded-lg bg-primary hover:bg-primary-hover"
            >
                Play Again
            </button>
        </div>
    );
};

export default Result;
