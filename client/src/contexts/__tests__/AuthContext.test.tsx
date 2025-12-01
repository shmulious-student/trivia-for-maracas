import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios
const mockPost = vi.fn();
vi.mock('axios', () => ({
    default: {
        post: (...args: unknown[]) => mockPost(...args),
        defaults: {
            headers: {
                common: {}
            }
        }
    }
}));

const TestComponent = () => {
    const { user, login, logout, isAuthenticated } = useAuth();
    return (
        <div>
            <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
            <div data-testid="username">{user?.username}</div>
            <button onClick={() => login('testuser')}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should start unauthenticated', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    it('should login successfully', async () => {
        mockPost.mockResolvedValueOnce({
            data: {
                token: 'fake-token',
                user: { id: '1', username: 'testuser' }
            }
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await act(async () => {
            screen.getByText('Login').click();
        });

        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('username')).toHaveTextContent('testuser');
        expect(localStorage.getItem('token')).toBe('fake-token');
    });

    it('should logout successfully', async () => {
        // Setup initial state
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({ id: '1', username: 'testuser' }));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');

        await act(async () => {
            screen.getByText('Logout').click();
        });

        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
        expect(localStorage.getItem('token')).toBeNull();
    });
});
