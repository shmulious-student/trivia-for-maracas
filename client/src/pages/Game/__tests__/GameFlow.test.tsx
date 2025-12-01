import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GameRouter from '../GameRouter';
import { useGameStore } from '../../../stores/useGameStore';
import { LanguageProvider } from '../../../contexts/LanguageContext';
// import type { IQuestion } from '@trivia/shared';

// Helper to render with providers
const renderWithProviders = (ui: React.ReactNode) => {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>
    );
};

describe('Game Flow', () => {
    beforeEach(() => {
        useGameStore.getState().resetGame();
    });

    it('should render Lobby initially', () => {
        renderWithProviders(<GameRouter />);
        expect(screen.getByText('Lobby')).toBeInTheDocument();
        expect(screen.getByText('Start Game')).toBeInTheDocument();
    });

    it('should start game and show first question', () => {
        renderWithProviders(<GameRouter />);

        fireEvent.click(screen.getByText('Start Game'));

        expect(screen.getByText('מהי בירת צרפת?')).toBeInTheDocument();
        expect(screen.getByText('פריז')).toBeInTheDocument();
        expect(screen.getByText('לונדון')).toBeInTheDocument();
    });

    it('should handle answering questions and game completion', () => {
        renderWithProviders(<GameRouter />);

        // Start Game
        fireEvent.click(screen.getByText('Start Game'));

        // Answer Question 1 (Correct: Paris)
        fireEvent.click(screen.getByText('פריז'));

        // Next Question button should appear
        const nextButton = screen.getByText('Next Question');
        expect(nextButton).toBeInTheDocument();

        fireEvent.click(nextButton);

        // Should show Question 2
        expect(screen.getByText('איזה כוכב לכת ידוע ככוכב האדום?')).toBeInTheDocument();

        // Answer Question 2 (Correct: Mars)
        fireEvent.click(screen.getByText('מאדים'));

        const nextButton2 = screen.getByText('Next Question');
        fireEvent.click(nextButton2);

        // Should show Result
        expect(screen.getByText('Game Over!')).toBeInTheDocument();
        // Max score is 20 (2 questions * 10)
        expect(screen.getByText('20')).toBeInTheDocument();

        // Play Again
        fireEvent.click(screen.getByText('Play Again'));
        expect(screen.getByText('Lobby')).toBeInTheDocument();
    });
});
