import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../useGameStore';
import { GameStatus, type IQuestion } from '@trivia/shared';

const MOCK_QUESTIONS: IQuestion[] = [
    {
        id: '1',
        text: { en: 'Q1', he: 'Q1' },
        options: [{ text: { en: 'A1', he: 'A1' } }, { text: { en: 'A2', he: 'A2' } }],
        correctAnswerIndex: 0,
        type: 'multiple-choice',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '2',
        text: { en: 'Q2', he: 'Q2' },
        options: [{ text: { en: 'B1', he: 'B1' } }, { text: { en: 'B2', he: 'B2' } }],
        correctAnswerIndex: 1,
        type: 'multiple-choice',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

describe('useGameStore', () => {
    beforeEach(() => {
        useGameStore.getState().resetGame();
    });

    it('should initialize with Lobby status', () => {
        const state = useGameStore.getState();
        expect(state.status).toBe(GameStatus.Lobby);
        expect(state.currentQuestionIndex).toBe(0);
        expect(state.score).toBe(0);
        expect(state.questions).toEqual([]);
        expect(state.answers).toEqual({});
    });

    it('should start game correctly', () => {
        useGameStore.getState().startGame(MOCK_QUESTIONS);
        const state = useGameStore.getState();

        expect(state.status).toBe(GameStatus.Playing);
        expect(state.questions).toEqual(MOCK_QUESTIONS);
        expect(state.currentQuestionIndex).toBe(0);
        expect(state.score).toBe(0);
    });

    it('should submit answer and update score', () => {
        useGameStore.getState().startGame(MOCK_QUESTIONS);

        // Correct answer for Q1 is index 0
        useGameStore.getState().submitAnswer('1', 0);

        let state = useGameStore.getState();
        expect(state.answers['1']).toBe(0);
        expect(state.score).toBe(10);

        // Incorrect answer for Q2 is index 0 (correct is 1)
        useGameStore.getState().nextQuestion();
        useGameStore.getState().submitAnswer('2', 0);

        state = useGameStore.getState();
        expect(state.answers['2']).toBe(0);
        expect(state.score).toBe(10); // Score shouldn't increase
    });

    it('should prevent multiple answers for the same question', () => {
        useGameStore.getState().startGame(MOCK_QUESTIONS);

        useGameStore.getState().submitAnswer('1', 0); // Correct (+10)
        useGameStore.getState().submitAnswer('1', 1); // Should be ignored

        const state = useGameStore.getState();
        expect(state.answers['1']).toBe(0);
        expect(state.score).toBe(10);
    });

    it('should move to next question and then to result', () => {
        useGameStore.getState().startGame(MOCK_QUESTIONS);

        // Q1
        useGameStore.getState().submitAnswer('1', 0);
        useGameStore.getState().nextQuestion();

        let state = useGameStore.getState();
        expect(state.currentQuestionIndex).toBe(1);
        expect(state.status).toBe(GameStatus.Playing);

        // Q2
        useGameStore.getState().submitAnswer('2', 1);
        useGameStore.getState().nextQuestion();

        state = useGameStore.getState();
        expect(state.status).toBe(GameStatus.Result);
    });

    it('should reset game', () => {
        useGameStore.getState().startGame(MOCK_QUESTIONS);
        useGameStore.getState().submitAnswer('1', 0);
        useGameStore.getState().resetGame();

        const state = useGameStore.getState();
        expect(state.status).toBe(GameStatus.Lobby);
        expect(state.score).toBe(0);
        expect(state.questions).toEqual([]);
        expect(state.answers).toEqual({});
    });
});
