import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../useGameStore';


describe('Bonus Scoring Logic', () => {
    beforeEach(() => {
        useGameStore.getState().resetGame();
    });

    it('should calculate bonus points correctly for fast answer', () => {
        const questions = [
            {
                id: '1',
                text: { en: 'Q1', he: 'Q1' },
                options: [
                    { text: { en: 'A', he: 'A' }, isCorrect: true },
                    { text: { en: 'B', he: 'B' }, isCorrect: false }
                ],
                correctAnswerIndex: 0,
                category: 'General',
                difficulty: 'easy',
                type: 'multiple'
            }
        ];

        useGameStore.getState().startGame(questions as any);

        // Answer correctly with 25s left out of 30s
        // Bonus = 50 * (25/30) * (60/30) = 50 * 0.833 * 2 = 83.33 -> 80
        useGameStore.getState().submitAnswer('1', 0, 25, 30);

        const state = useGameStore.getState();
        expect(state.score).toBe(10 + 80); // Base 10 + Bonus 80
        expect(state.lastBonusPoints).toBe(80);
    });

    it('should give higher bonus for shorter total time', () => {
        const questions = [
            {
                id: '1',
                text: { en: 'Q1', he: 'Q1' },
                options: [
                    { text: { en: 'A', he: 'A' }, isCorrect: true },
                    { text: { en: 'B', he: 'B' }, isCorrect: false }
                ],
                correctAnswerIndex: 0,
                category: 'General',
                difficulty: 'easy',
                type: 'multiple'
            }
        ];

        useGameStore.getState().startGame(questions as any);

        // Answer correctly with 8s left out of 10s
        // Bonus = 50 * (8/10) * (60/10) = 50 * 0.8 * 6 = 240 -> 240
        useGameStore.getState().submitAnswer('1', 0, 8, 10);

        const state = useGameStore.getState();
        expect(state.score).toBe(10 + 240);
        expect(state.lastBonusPoints).toBe(240);
    });

    it('should give 0 bonus if time left is 0', () => {
        const questions = [
            {
                id: '1',
                text: { en: 'Q1', he: 'Q1' },
                options: [
                    { text: { en: 'A', he: 'A' }, isCorrect: true },
                    { text: { en: 'B', he: 'B' }, isCorrect: false }
                ],
                correctAnswerIndex: 0,
                category: 'General',
                difficulty: 'easy',
                type: 'multiple'
            }
        ];

        useGameStore.getState().startGame(questions as any);

        useGameStore.getState().submitAnswer('1', 0, 0, 30);

        const state = useGameStore.getState();
        expect(state.score).toBe(10); // Base 10 only
        expect(state.lastBonusPoints).toBe(0);
    });

    it('should give 0 bonus for wrong answer', () => {
        const questions = [
            {
                id: '1',
                text: { en: 'Q1', he: 'Q1' },
                options: [
                    { text: { en: 'A', he: 'A' }, isCorrect: true },
                    { text: { en: 'B', he: 'B' }, isCorrect: false }
                ],
                correctAnswerIndex: 0,
                category: 'General',
                difficulty: 'easy',
                type: 'multiple'
            }
        ];

        useGameStore.getState().startGame(questions as any);

        useGameStore.getState().submitAnswer('1', 1, 25, 30); // Wrong answer

        const state = useGameStore.getState();
        expect(state.score).toBe(0);
        expect(state.lastBonusPoints).toBe(0);
    });
});
