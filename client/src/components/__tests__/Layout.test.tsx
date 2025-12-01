import { render, screen } from '@testing-library/react';
import Layout from '../Layout';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

describe('Layout', () => {
    it('should render header and content', () => {
        render(
            <LanguageProvider>
                <ThemeProvider>
                    <BrowserRouter>
                        <Layout />
                    </BrowserRouter>
                </ThemeProvider>
            </LanguageProvider>
        );

        expect(screen.getByText('Trivia App')).toBeInTheDocument();
        expect(screen.getByTitle('Toggle Theme')).toBeInTheDocument();
        expect(screen.getByTitle('Switch Language')).toBeInTheDocument();
    });
});
