import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Brain } from 'lucide-react';
import './Home.css';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Skeleton from '../components/Skeleton';

const Home = ({ isSidebarOpen }) => {
    const { t, language } = useLanguage();
    const { isAuthenticated, profile, user, loading: authLoading } = useAuth();
    const [greeting, setGreeting] = useState("");
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [quizMode, setQuizMode] = useState(false);
    const [showTrialModal, setShowTrialModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const lastLanguageRef = useRef(null);

    // Get user's first name
    const userName = profile?.display_name?.split(' ')[0] ||
        user?.user_metadata?.display_name?.split(' ')[0] ||
        user?.email?.split('@')[0] ||
        '';

    useEffect(() => {
        // Wait for auth to finish loading before generating greeting
        if (authLoading) {
            setIsLoading(true);
            return;
        }

        // Cache key includes user to regenerate when user changes
        const cacheKey = `${language}_${userName || 'guest'}`;
        const storedKey = sessionStorage.getItem('home_greeting_key');
        const storedGreeting = sessionStorage.getItem('home_greeting');
        const storedSuggestions = sessionStorage.getItem('home_suggestions');

        if (storedKey === cacheKey && storedGreeting && storedSuggestions) {
            // Use stored values
            setGreeting(storedGreeting);
            setSuggestions(JSON.parse(storedSuggestions));
            setIsLoading(false);
            return;
        }

        // Generate new greeting with user name
        const greetings = t('home.greetings');
        const greetingList = Array.isArray(greetings) ? greetings : [greetings];
        let randomGreeting = greetingList[Math.floor(Math.random() * greetingList.length)];

        // Replace {name} placeholder with actual name or use fallback for guests
        if (userName) {
            randomGreeting = randomGreeting.replace('{name}', userName);
        } else {
            // Fallback greeting for guests (no name)
            randomGreeting = language === 'id' ? 'Hei, mau belajar apa?' : "Hey, what's on your mind?";
        }

        setGreeting(randomGreeting);

        // Generate smart suggestions
        const defaultSuggestions = t('home.suggestions');
        const suggestionsList = Array.isArray(defaultSuggestions) ? defaultSuggestions : [];
        const shuffled = [...suggestionsList].sort(() => 0.5 - Math.random());
        const selectedSuggestions = shuffled.slice(0, 5);
        setSuggestions(selectedSuggestions);

        // Store in sessionStorage
        sessionStorage.setItem('home_greeting_key', cacheKey);
        sessionStorage.setItem('home_greeting', randomGreeting);
        sessionStorage.setItem('home_suggestions', JSON.stringify(selectedSuggestions));

        setIsLoading(false);
    }, [language, t, userName, authLoading]);

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
                navigate(`/result?q=${encodeURIComponent(query)}&quiz=${quizMode}`, { state: { query, quizMode } });
            }
        }
    };

    const handleSuggestionClick = (suggestion) => {
        if (checkTrialLimit()) {
            navigate(`/result?q=${encodeURIComponent(suggestion)}&quiz=${quizMode}`, { state: { query: suggestion, quizMode } });
        }
    };

    return (
        <div className="home-container">
            <div className="home-content-wrapper">
                {isLoading ? (
                    <>
                        <div className="skeleton-greeting">
                            <Skeleton width="60%" height="48px" />
                        </div>
                        <div className="suggestions-container skeleton-suggestions">
                            <Skeleton width="140px" height="42px" variant="button" />
                            <Skeleton width="180px" height="42px" variant="button" />
                            <Skeleton width="160px" height="42px" variant="button" />
                            <Skeleton width="200px" height="42px" variant="button" />
                            <Skeleton width="150px" height="42px" variant="button" />
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="hero-title">{greeting}</h1>

                        <div className="suggestions-container">
                            <AnimatePresence>
                                {suggestions.map((suggestion, index) => (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="suggestion-chip"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </>
                )}
                <div className="content-fade-overlay"></div>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
                <div className="input-container">
                    <textarea
                        className="search-input"
                        placeholder={t('home.placeholder') || "Ask anything..."}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSearch(e);
                            }
                        }}
                        rows={1}
                    />
                    <div className="input-actions">
                        <button
                            type="button"
                            className={`quiz-icon-btn ${quizMode ? 'active' : ''}`}
                            onClick={() => setQuizMode(!quizMode)}
                        >
                            <Brain size={20} />
                            {quizMode && (
                                <span className="quiz-mode-text">
                                    Quiz Mode On
                                </span>
                            )}
                        </button>
                        <button type="submit" className="search-button">
                            <ArrowUp size={20} />
                        </button>
                    </div>
                </div>
            </form>

            <AnimatePresence>
                {showTrialModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowTrialModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;

