import { render, screen, act } from '@testing-library/react';
import { AdminAuthProvider, useAdminAuth } from '../AdminAuthContext';
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
    const { user, login, logout, isAuthenticated } = useAdminAuth();
    return (
        <div>
            <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
            <div data-testid="username">{user?.username}</div>
            <button onClick={() => login('admin', 'password')}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AdminAuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should start unauthenticated', () => {
        render(
            <AdminAuthProvider>
                <TestComponent />
            </AdminAuthProvider>
        );
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    it('should login successfully', async () => {
        mockPost.mockResolvedValueOnce({
            data: {
                token: 'fake-admin-token',
                user: { id: '1', username: 'admin', isAdmin: true }
            }
        });

        render(
            <AdminAuthProvider>
                <TestComponent />
            </AdminAuthProvider>
        );

        await act(async () => {
            screen.getByText('Login').click();
        });

        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('username')).toHaveTextContent('admin');
        expect(localStorage.getItem('adminToken')).toBe('fake-admin-token');
    });
});
