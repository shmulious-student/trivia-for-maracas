import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { IUser } from '@trivia/shared';

interface AdminAuthContextType {
    user: IUser | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(() => {
        const storedUser = localStorage.getItem('adminUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('adminToken'));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', { username, password });
            const { token: newToken, user: newUser } = response.data;

            localStorage.setItem('adminToken', newToken);
            localStorage.setItem('adminUser', JSON.stringify(newUser));

            setToken(newToken);
            setUser(newUser);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setToken(null);
        setUser(null);
    };

    return (
        <AdminAuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};
