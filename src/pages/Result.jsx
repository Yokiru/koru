import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import Card from '../components/Card';
import FeedbackCard from '../components/FeedbackCard';
import QuizCard from '../components/QuizCard';
import { generateExplanation, generateClarification, generateQuizQuestions } from '../services/gemini';
import { supabase } from '../services/supabase';
import './Result.css';

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = location.state?.query || "Learning";
    const quizMode = location.state?.quizMode || false;

    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [error, setError] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

    useEffect(() => {
        const fetchExplanation = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Check Supabase history first
                const { data: cachedData, error: dbError } = await supabase
                    .from('history')
                    .select('*')
                    .eq('query', query)
                    .limit(1)
                    .maybeSingle();

                if (cachedData && cachedData.content) {
                    console.log("Loaded from cache:", query);
                    setCards(cachedData.content);
                    setLoading(false);
                    return;
                }

                // 2. If not in history, generate new
                const explanationCards = await generateExplanation(query);
                setCards(explanationCards);

                // 3. Save to Supabase
                await saveToHistory(query, explanationCards);

            } catch (err) {
                console.error("Failed to fetch explanation", err);
                setError(`Error: ${err.message || "Unknown error"}. Check console for details.`);
            } finally {
                setLoading(false);
            }
        };

        fetchExplanation();
    }, [query]);

    // Generate quiz questions after cards are loaded and quiz mode is on
    useEffect(() => {
        const fetchQuiz = async () => {
            if (!quizMode || cards.length === 0 || quizQuestions.length > 0) return;

            try {
                const questions = await generateQuizQuestions(query, 3);
                setQuizQuestions(questions);
            } catch (err) {
                console.error("Failed to generate quiz", err);
            }
        };

        fetchQuiz();
    }, [cards, quizMode, query, quizQuestions.length]);

    const maintainHistoryLimit = async () => {
        try {
            // Fetch IDs of all items, ordered by newest first
            const { data } = await supabase
                .from('history')
                .select('id')
                .order('created_at', { ascending: false });

            if (data && data.length > 10) {
                // Keep the first 10, delete the rest
                const itemsToDelete = data.slice(10).map(item => item.id);

                if (itemsToDelete.length > 0) {
                    await supabase
                        .from('history')
                        .delete()
                        .in('id', itemsToDelete);
                }
            }
        } catch (e) {
            console.error("Failed to maintain history limit", e);
        }
    };

    const saveToHistory = async (query, content) => {
        try {
            // Check if already exists
            const { data: existing } = await supabase
                .from('history')
                .select('id')
                .eq('query', query)
                .limit(1)
                .maybeSingle();

            if (existing) {
                // Update timestamp to move to top
                await supabase
                    .from('history')
                    .update({ created_at: new Date().toISOString(), content: content })
                    .eq('id', existing.id);
            } else {
                // Insert new
                const { error } = await supabase
                    .from('history')
                    .insert([
                        { query, content }
                    ]);
                if (error) throw error;
            }

            // Enforce limit
            await maintainHistoryLimit();

            // Trigger update in Sidebar
            window.dispatchEvent(new Event('historyUpdated'));
        } catch (e) {
            console.error("Failed to save history", e);
        }
    };

    const handleNext = () => {
        if (showQuiz && currentQuizIndex < quizQuestions.length - 1) {
            // Move to next quiz question
            setCurrentQuizIndex(prev => prev + 1);
        } else if (showQuiz) {
            // Finished all quiz questions
            navigate('/');
        } else if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else if (quizMode && quizQuestions.length > 0 && !showQuiz) {
            // Finished explanation cards, start quiz
            setShowQuiz(true);
            setCurrentQuizIndex(0);
        } else {
            setShowFeedback(true);
        }
    };

    const handleBack = () => {
        if (showQuiz && currentQuizIndex > 0) {
            setCurrentQuizIndex(prev => prev - 1);
        } else if (showQuiz) {
            // Go back to explanation cards
            setShowQuiz(false);
            setCurrentIndex(cards.length - 1);
        } else if (showFeedback) {
            setShowFeedback(false);
        } else if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            navigate('/');
        }
    };

    const handleHome = () => {
        navigate('/');
    };

    const handleQuizAnswer = (isCorrect) => {
        // Just log the answer, don't auto-advance
        console.log(`Answer was ${isCorrect ? 'correct' : 'incorrect'}`);
    };

    const handleFeedbackSubmit = async (type, text) => {
        if (type === 'understood') {
            navigate('/');
        } else if (type === 'confused') {
            setGenerating(true);
            try {
                // Generate clarification based on the specific confusion
                const clarification = await generateClarification(query, text);

                // Add clarification card after current cards
                setCards(prev => [...prev, clarification]);

                // Move to the new card
                setShowFeedback(false);
                setCurrentIndex(prev => prev + 1);
            } catch (err) {
                console.error("Failed to generate clarification", err);
                // Optionally handle error here
            } finally {
                setGenerating(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="result-container loading">
                <div className="loader"></div>
                <p className="loading-text">Generating explanation for "{query}"...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="result-container loading">
                <p className="loading-text">{error}</p>
                <button onClick={() => navigate('/')} className="nav-button" style={{ marginTop: '1rem' }}>
                    <Home size={20} /> Go Home
                </button>
            </div>
        );
    }

    return (
        <div className="result-container">
            <header className="result-header">
                <h1 className="topic-title">{query}</h1>
                <button onClick={handleHome} className="icon-button" aria-label="Home">
                    <Home size={24} />
                </button>
            </header>

            <div className="result-content">
                <AnimatePresence mode='wait'>
                    {generating ? (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="generating-loader"
                        >
                            <div className="loader small"></div>
                            <p>Clarifying...</p>
                        </motion.div>
                    ) : showQuiz ? (
                        <QuizCard
                            key={`quiz-${currentQuizIndex}`}
                            question={quizQuestions[currentQuizIndex]?.question}
                            type={quizQuestions[currentQuizIndex]?.type}
                            options={quizQuestions[currentQuizIndex]?.options}
                            correctAnswer={quizQuestions[currentQuizIndex]?.correctAnswer}
                            explanation={quizQuestions[currentQuizIndex]?.explanation}
                            onAnswer={handleQuizAnswer}
                        />
                    ) : showFeedback ? (
                        <FeedbackCard
                            key="feedback"
                            onSubmit={handleFeedbackSubmit}
                        />
                    ) : (
                        <Card
                            key={currentIndex}
                            title={cards[currentIndex]?.title}
                            content={cards[currentIndex]?.content}
                        />
                    )}
                </AnimatePresence>
            </div>

            <footer className="result-footer">
                <button
                    onClick={handleBack}
                    className="nav-button"
                    disabled={generating}
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="progress-indicators">
                    {cards.map((_, idx) => (
                        <div
                            key={idx}
                            className={`indicator ${!showFeedback && !showQuiz && idx === currentIndex ? 'active' : ''}`}
                        />
                    ))}
                    {quizMode && quizQuestions.map((_, idx) => (
                        <div
                            key={`quiz-${idx}`}
                            className={`indicator ${showQuiz && idx === currentQuizIndex ? 'active' : ''}`}
                            style={{ background: 'var(--accent)' }}
                        />
                    ))}
                    {!quizMode && <div className={`indicator feedback-indicator ${showFeedback ? 'active' : ''}`} />}
                </div>

                <button
                    onClick={handleNext}
                    className={`nav-button ${showFeedback ? 'hidden' : ''}`}
                    style={{ visibility: showFeedback ? 'hidden' : 'visible' }}
                    disabled={generating}
                >
                    Next
                    <ArrowRight size={20} />
                </button>
            </footer>
        </div>
    );
};

export default Result;
