import { create } from 'zustand';
import { GameStatus, type IQuestion } from '@trivia/shared';

interface GameState {
    status: GameStatus;
    currentQuestionIndex: number;
    score: number;
    questions: IQuestion[];
    answers: Record<string, number>;

    // Actions
    startGame: (questions: IQuestion[]) => void;
    submitAnswer: (questionId: string, answerIndex: number) => void;
    nextQuestion: () => void;
    resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    status: GameStatus.Lobby,
    currentQuestionIndex: 0,
    score: 0,
    questions: [],
    answers: {},

    startGame: (questions) => {
        set({
            status: GameStatus.Playing,
            questions,
            currentQuestionIndex: 0,
            score: 0,
            answers: {}
        });
    },

    submitAnswer: (questionId, answerIndex) => {
        const { questions, currentQuestionIndex, answers } = get();
        const question = questions[currentQuestionIndex];

        // Prevent multiple answers for the same question
        if (answers[questionId] !== undefined) return;

        // Calculate score (simple +10 for correct for now)
        const isCorrect = question.correctAnswerIndex === answerIndex;
        const scoreIncrement = isCorrect ? 10 : 0;

        set((state) => ({
            answers: { ...state.answers, [questionId]: answerIndex },
            score: state.score + scoreIncrement
        }));
    },

    nextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex >= questions.length) {
            set({ status: GameStatus.Result });
        } else {
            set({ currentQuestionIndex: nextIndex });
        }
    },

    resetGame: () => {
        set({
            status: GameStatus.Lobby,
            currentQuestionIndex: 0,
            score: 0,
            questions: [],
            answers: {}
        });
    }
}));
