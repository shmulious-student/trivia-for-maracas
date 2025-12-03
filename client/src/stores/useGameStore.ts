import { create } from 'zustand';
import { GameStatus, type IQuestion } from '@trivia/shared';

interface GameState {
    status: GameStatus;
    currentQuestionIndex: number;
    score: number;
    questions: IQuestion[];
    answers: Record<string, number>;
    isResultSubmitted: boolean;
    isSubmitting: boolean;
    lastBonusPoints: number;
    gameId: string;

    // Actions
    startGame: (questions: IQuestion[]) => void;
    submitAnswer: (questionId: string, answerIndex: number, timeLeft?: number, totalTime?: number) => void;
    nextQuestion: () => void;
    resetGame: () => void;
    setResultSubmitted: (submitted: boolean) => void;
    setSubmitting: (submitting: boolean) => void;
}

// Simple UUID generator that works in insecure contexts (like mobile IP access)
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const useGameStore = create<GameState>((set, get) => ({
    status: GameStatus.Lobby,
    currentQuestionIndex: 0,
    score: 0,
    questions: [],
    answers: {},
    isResultSubmitted: false,
    isSubmitting: false,
    lastBonusPoints: 0,
    gameId: '',

    startGame: (questions) => {
        set({
            status: GameStatus.Playing,
            questions,
            currentQuestionIndex: 0,
            score: 0,
            answers: {},
            isResultSubmitted: false,
            isSubmitting: false,
            lastBonusPoints: 0,
            gameId: generateUUID()
        });
    },

    submitAnswer: (questionId, answerIndex, timeLeft = 0, totalTime = 30) => {
        const { questions, currentQuestionIndex, answers } = get();
        const question = questions[currentQuestionIndex];

        // Prevent multiple answers for the same question
        if (answers[questionId] !== undefined) return;

        // Calculate score (simple +10 for correct for now)
        const isCorrect = question.correctAnswerIndex === answerIndex;
        let scoreIncrement = isCorrect ? 10 : 0;
        let bonusPoints = 0;

        if (isCorrect && timeLeft > 0 && totalTime > 0) {
            // Bonus Formula: BaseBonus * (TimeLeft / TotalTime) * (60 / TotalTime)
            // BaseBonus = 50
            const baseBonus = 50;
            const timeFactor = timeLeft / totalTime;
            const difficultyFactor = 60 / totalTime;

            const rawBonus = baseBonus * timeFactor * difficultyFactor;

            // Round to nearest 10
            bonusPoints = Math.round(rawBonus / 10) * 10;
            scoreIncrement += bonusPoints;
        }

        set((state) => ({
            answers: { ...state.answers, [questionId]: answerIndex },
            score: state.score + scoreIncrement,
            lastBonusPoints: bonusPoints
        }));
    },

    nextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex >= questions.length) {
            set({ status: GameStatus.Result });
        } else {
            set({ currentQuestionIndex: nextIndex, lastBonusPoints: 0 });
        }
    },

    resetGame: () => {
        set({
            status: GameStatus.Lobby,
            currentQuestionIndex: 0,
            score: 0,
            questions: [],
            answers: {},
            isResultSubmitted: false,
            isSubmitting: false,
            lastBonusPoints: 0,
            gameId: ''
        });
    },

    setResultSubmitted: (submitted) => {
        set({ isResultSubmitted: submitted });
    },

    setSubmitting: (submitting) => {
        set({ isSubmitting: submitting });
    }
}));
