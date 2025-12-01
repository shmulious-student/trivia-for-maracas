import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { useLanguage } from '../../contexts/LanguageContext';

const Question: React.FC = () => {
    const { language } = useLanguage();
    const { questions, currentQuestionIndex, submitAnswer, nextQuestion, answers } = useGameStore();

    const question = questions[currentQuestionIndex];
    const selectedAnswer = answers[question.id];
    const hasAnswered = selectedAnswer !== undefined;

    const handleAnswer = (index: number) => {
        if (!hasAnswered) {
            submitAnswer(question.id, index);
        }
    };

    if (!question) return <div>Loading...</div>;

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 space-y-8">
            <div className="w-full max-w-2xl">
                <div className="mb-4 text-xl text-center text-text-secondary">
                    Question {currentQuestionIndex + 1} / {questions.length}
                </div>

                <h2 className="mb-8 text-3xl font-bold text-center text-text-primary">
                    {question.text[language]}
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {question.options.map((option, index) => {
                        let buttonClass = "p-6 text-lg font-semibold transition-all rounded-xl border-2 ";

                        if (hasAnswered) {
                            if (index === question.correctAnswerIndex) {
                                buttonClass += "bg-green-500/20 border-green-500 text-green-500";
                            } else if (index === selectedAnswer) {
                                buttonClass += "bg-red-500/20 border-red-500 text-red-500";
                            } else {
                                buttonClass += "bg-surface border-border text-text-secondary opacity-50";
                            }
                        } else {
                            buttonClass += "bg-surface border-border hover:border-primary hover:bg-primary/10 cursor-pointer";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                disabled={hasAnswered}
                                className={buttonClass}
                            >
                                {option.text[language]}
                            </button>
                        );
                    })}
                </div>

                {hasAnswered && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={nextQuestion}
                            className="px-8 py-3 text-xl font-bold text-white transition-colors rounded-lg bg-primary hover:bg-primary-hover"
                        >
                            Next Question
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Question;
