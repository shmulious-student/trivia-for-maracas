import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import SubjectManager from './pages/SubjectManager';
import QuestionManager from './pages/QuestionManager';
import TranslationManager from './pages/TranslationManager';
import { initPostHog } from './lib/posthog';
import './index.css';

// Initialize Analytics
initPostHog();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="subjects" element={<SubjectManager />} />
            <Route path="subjects/:subjectId/questions" element={<QuestionManager />} />
            <Route path="translations" element={<TranslationManager />} />
            <Route path="settings" element={<div>Settings Placeholder</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
};

export default App;
