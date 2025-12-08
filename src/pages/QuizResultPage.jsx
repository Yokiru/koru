import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, RotateCcw, CheckCircle, XCircle, Trophy, Sparkles, TrendingUp, Target, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { saveQuizResult } from '../services/quizService';
import './QuizResultPage.css';

const QuizResultPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { quizId } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [animatedPercentage, setAnimatedPercentage] = useState(0);
    const [showStats, setShowStats] = useState(false);
    const [resultSaved, setResultSaved] = useState(false);

    const { quizData, userAnswers, score, totalQuestions } = location.state || {
        quizData: { topic: 'Quiz' },
        userAnswers: [],
        score: 0,
        totalQuestions: 0
    };

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= 70;

    // Save quiz result to database
    useEffect(() => {
        const saveResult = async () => {
            if (isAuthenticated && user && quizId && !resultSaved && !quizId.startsWith('ai-')) {
                try {
                    const results = {
                        score,
                        totalQuestions,
                        answers: userAnswers
                    };
                    console.log('Saving quiz result:', { quizId, userId: user.id, results });
                    const { error } = await saveQuizResult(quizId, user.id, results);
                    if (!error) {
                        setResultSaved(true);
                        console.log('Quiz result saved successfully');
                    } else {
                        console.error('Error saving quiz result:', error);
                    }
                } catch (err) {
                    console.error('Error saving quiz result:', err);
                }
            }
        };
        saveResult();
    }, [isAuthenticated, user, quizId, score, totalQuestions, userAnswers, resultSaved]);

    // Animate percentage counter
    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const increment = percentage / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= percentage) {
                setAnimatedPercentage(percentage);
                clearInterval(timer);
                setShowStats(true);
            } else {
                setAnimatedPercentage(Math.round(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [percentage]);

    // Trigger confetti if passed
    useEffect(() => {
        if (passed && animatedPercentage === percentage) {
            const count = 200;
            const defaults = {
                origin: { y: 0.7 },
                zIndex: 1000
            };

            function fire(particleRatio, opts) {
                confetti({
                    ...defaults,
                    ...opts,
                    particleCount: Math.floor(count * particleRatio),
                    colors: ['#f76f53', '#ff8a65', '#ffab91', '#4ade80', '#fbbf24']
                });
            }

            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 45 });
        }
    }, [passed, animatedPercentage, percentage]);

    const getScoreColor = () => {
        if (percentage >= 80) return '#4ade80';
        if (percentage >= 60) return '#fbbf24';
        return '#ff3b30';
    };

    const getScoreMessage = () => {
        if (percentage >= 90) return { text: 'Outstanding!', icon: <Sparkles className="message-icon sparkle" /> };
        if (percentage >= 80) return { text: 'Excellent!', icon: <Trophy className="message-icon trophy" /> };
        if (percentage >= 70) return { text: 'Great Job!', icon: <TrendingUp className="message-icon trending" /> };
        if (percentage >= 60) return { text: 'Good Effort!', icon: <Target className="message-icon target" /> };
        return { text: 'Keep Practicing!', icon: <Zap className="message-icon zap" /> };
    };

    const scoreMessage = getScoreMessage();

    return (
        <div className="quiz-result-page">
            <button onClick={() => navigate('/')} className="icon-button" aria-label="Home">
                <Home size={24} />
            </button>

            <div className="result-container">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="result-hero"
                >
                    <motion.div
                        className="hero-icon-wrapper"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                        {scoreMessage.icon}
                    </motion.div>

                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {scoreMessage.text}
                    </motion.h1>

                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        You've completed: <span className="topic-highlight">{quizData.topic}</span>
                    </motion.p>
                </motion.div>

                {/* Score Display */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="score-showcase"
                >
                    <div className="score-ring-container">
                        <svg className="score-ring" viewBox="0 0 200 200">
                            <circle
                                className="score-ring-bg"
                                cx="100"
                                cy="100"
                                r="85"
                                fill="none"
                                strokeWidth="12"
                            />
                            <motion.circle
                                className="score-ring-progress"
                                cx="100"
                                cy="100"
                                r="85"
                                fill="none"
                                strokeWidth="12"
                                stroke={getScoreColor()}
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: percentage / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                style={{
                                    transformOrigin: 'center',
                                    transform: 'rotate(-90deg)'
                                }}
                            />
                        </svg>
                        <div className="score-content">
                            <motion.span
                                className="score-number"
                                style={{ color: getScoreColor() }}
                            >
                                {animatedPercentage}%
                            </motion.span>
                            <span className="score-text">Score</span>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showStats && (
                            <motion.div
                                className="stats-grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="stat-card">
                                    <div className="stat-icon-wrapper correct">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-number">{score}</span>
                                        <span className="stat-label">Correct</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon-wrapper incorrect">
                                        <XCircle size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-number">{totalQuestions - score}</span>
                                        <span className="stat-label">Incorrect</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon-wrapper total">
                                        <Target size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-number">{totalQuestions}</span>
                                        <span className="stat-label">Total</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Answer Review */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="review-section"
                >
                    <h2 className="review-title">
                        <span className="review-title-icon">📝</span>
                        Answer Review
                    </h2>
                    <div className="answers-list">
                        {userAnswers.map((answer, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                className={`answer-card ${answer.isCorrect ? 'correct' : 'incorrect'}`}
                            >
                                <div className="answer-card-header">
                                    <span className="question-badge">Q{index + 1}</span>
                                    <span className={`status-badge ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                                        {answer.isCorrect ? (
                                            <><CheckCircle size={14} /> Correct</>
                                        ) : (
                                            <><XCircle size={14} /> Incorrect</>
                                        )}
                                    </span>
                                </div>
                                <p className="answer-card-question">{answer.question}</p>
                                <div className="answer-card-details">
                                    <div className="answer-row">
                                        <span className="answer-row-label">Your answer:</span>
                                        <span className={`answer-row-value ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                                            {answer.selectedAnswer}
                                        </span>
                                    </div>
                                    {!answer.isCorrect && (
                                        <div className="answer-row">
                                            <span className="answer-row-label">Correct:</span>
                                            <span className="answer-row-value correct">
                                                {answer.correctAnswer}
                                            </span>
                                        </div>
                                    )}
                                    {answer.explanation && (
                                        <div className="answer-explanation">
                                            <span className="explanation-icon">💡</span>
                                            <p className="explanation-text">{answer.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="action-buttons"
                >
                    <button
                        onClick={() => navigate('/quizzes')}
                        className="action-btn secondary"
                    >
                        <Home size={20} />
                        Back to Quizzes
                    </button>
                    <button
                        onClick={() => navigate(-2)}
                        className="action-btn primary"
                    >
                        <RotateCcw size={20} />
                        Try Again
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default QuizResultPage;
