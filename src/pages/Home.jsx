import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Brain } from 'lucide-react';
import './Home.css';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Home = ({ isSidebarOpen }) => {
    const { t, language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [greeting, setGreeting] = useState("");
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [quizMode, setQuizMode] = useState(false);
    const [showTrialModal, setShowTrialModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const greetings = t('home.greetings');
        const greetingList = Array.isArray(greetings) ? greetings : [greetings];
        const randomGreeting = greetingList[Math.floor(Math.random() * greetingList.length)];
        setGreeting(randomGreeting);

        // Generate smart suggestions - only show defaults for now
        const defaultSuggestions = t('home.suggestions');
        const suggestionsList = Array.isArray(defaultSuggestions) ? defaultSuggestions : [];
        const shuffled = [...suggestionsList].sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 5));
    }, [language, t]);

    const checkTrialLimit = () => {
        if (isAuthenticated) return true;

        const trialUsed = localStorage.getItem('guest_trial_used');
        if (trialUsed === 'true') {
            setShowTrialModal(true);
            return false;
        }

        // Mark trial as used
        localStorage.setItem('guest_trial_used', 'true');
        return true;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            if (checkTrialLimit()) {
                navigate('/result', { state: { query, quizMode } });
            }
        }
    };

    const handleSuggestionClick = (suggestion) => {
        if (checkTrialLimit()) {
            navigate('/result', { state: { query: suggestion, quizMode } });
        }
    };

    return (
        <div className="home-container">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hero-title"
            >
                {greeting}
            </motion.h1>

            <motion.form
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onSubmit={handleSearch}
                className="search-form"
            >
                <div className="input-container">
                    <textarea
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSearch(e);
                            }
                        }}
                        placeholder={t('home.placeholder')}
                        className="search-input"
                        rows="1"
                    />
                    <div className="input-actions">
                        <button
                            type="button"
                            onClick={() => setQuizMode(!quizMode)}
                            className={`quiz-icon-btn ${quizMode ? 'active' : ''}`}
                            aria-label={t('home.quiz_mode')}
                            title={t('home.quiz_mode')}
                        >
                            <Brain size={20} />
                            {quizMode && <span className="quiz-mode-text">{t('home.quiz_mode')}</span>}
                        </button>
                        <button
                            type="submit"
                            className="search-button"
                        >
                            <ArrowUp size={20} />
                        </button>
                    </div>
                </div>
            </motion.form>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="suggestions-container"
            >
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="suggestion-chip"
                    >
                        {suggestion}
                    </button>
                ))}
            </motion.div>

            {/* Trial Limit Modal */}
            {showTrialModal && (
                <div className="modal-overlay" onClick={() => setShowTrialModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>🎓 Ready to Learn More?</h2>
                        <p>You've used your free trial! Sign in to continue learning without limits.</p>
                        <div className="modal-actions">
                            <button
                                className="modal-button primary"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </button>
                            <button
                                className="modal-button secondary"
                                onClick={() => navigate('/register')}
                            >
                                Create Account
                            </button>
                        </div>
                        <button
                            className="modal-close"
                            onClick={() => setShowTrialModal(false)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
