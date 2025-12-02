import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import { initPostHog } from './lib/posthog';
import './index.css';

// Initialize Analytics
initPostHog();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

import GameRouter from './pages/Game/GameRouter';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="/" element={<GameRouter />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
