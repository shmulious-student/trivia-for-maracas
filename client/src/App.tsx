import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Settings from './pages/Settings';
import './index.css';

import Lobby from './pages/Game/Lobby';
import Question from './pages/Game/Question';
import Result from './pages/Game/Result';
import { useGameStore } from './stores/useGameStore';
import { GameStatus } from '@trivia/shared';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const GameRouter = () => {
  const status = useGameStore((state) => state.status);

  switch (status) {
    case GameStatus.Lobby:
      return <Lobby />;
    case GameStatus.Playing:
      return <Question />;
    case GameStatus.Result:
      return <Result />;
    default:
      return <Lobby />;
  }
};

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
