import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Lazy load all pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Result = React.lazy(() => import('./pages/Result'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const QuizzesPage = React.lazy(() => import('./pages/QuizzesPage'));
const CreateQuizPage = React.lazy(() => import('./pages/CreateQuizPage'));
const QuizTakePage = React.lazy(() => import('./pages/QuizTakePage'));
const QuizResultPage = React.lazy(() => import('./pages/QuizResultPage'));
const QuizFullPage = React.lazy(() => import('./pages/QuizFullPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import PlanModal from './components/PlanModal';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import './App.css';
import { AUTH_ROUTES } from './utils/constants';

// Create context for settings modal
export const SettingsContext = React.createContext();

// Create context for plan modal
export const PlanContext = React.createContext();

// Simple loading fallback - empty to avoid flash of "Loading..." text
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'var(--bg-primary)'
  }} />
);

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  const openPlan = () => setIsPlanOpen(true);
  const closePlan = () => setIsPlanOpen(false);

  // Hide sidebar on auth pages
  const hideSidebar = AUTH_ROUTES.includes(location.pathname);

  return (
    <SettingsContext.Provider value={{ openSettings, closeSettings, isSettingsOpen }}>
      <PlanContext.Provider value={{ openPlan, closePlan, isPlanOpen }}>
        <div className="app-container">
          {/* Theme toggle disabled for now
          {location.pathname === '/' && (
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          */}
          {!hideSidebar && <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />}
          <main className={`main-content ${isSidebarOpen && !hideSidebar ? 'sidebar-open' : ''}`}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home isSidebarOpen={isSidebarOpen} />} />
                <Route path="/result" element={<Result />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/quizzes" element={<ProtectedRoute><QuizzesPage /></ProtectedRoute>} />
                <Route path="/create-quiz" element={<ProtectedRoute><CreateQuizPage /></ProtectedRoute>} />
                <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizTakePage /></ProtectedRoute>} />
                <Route path="/quiz-full/:quizId" element={<ProtectedRoute><QuizFullPage /></ProtectedRoute>} />
                <Route path="/quiz/:quizId/results" element={<ProtectedRoute><QuizResultPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>

          {/* Settings Modal - renders on top of everything */}
          <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />

          {/* Plan Modal - renders on top of everything */}
          <PlanModal isOpen={isPlanOpen} onClose={closePlan} currentPlan="free" />
        </div>
      </PlanContext.Provider>
    </SettingsContext.Provider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
