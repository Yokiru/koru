import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronDown, Check, Home, Trash2, ArrowUpDown, CheckCircle, Eye, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserQuizzes, deleteQuiz } from '../services/quizService';
import { SkeletonQuizCard } from '../components/Skeleton';
import './QuizzesPage.css';

const QuizzesPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('activity');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const sortRef = useRef(null);

    // Fetch quizzes from database
    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!user) {
                setQuizzes([]);
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching quizzes for user:', user.id);
                const { data, error } = await getUserQuizzes(user.id);
                if (error) throw error;
                console.log('Fetched quizzes:', data);
                setQuizzes(data || []);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
                setQuizzes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();

        // Re-fetch when window regains focus (returning from quiz)
        const handleFocus = () => {
            if (user) {
                fetchQuizzes();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNewQuiz = () => {
        navigate('/create-quiz');
    };

    const handleDeleteQuiz = async (e, quizId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                const { error } = await deleteQuiz(quizId);
                if (!error) {
                    setQuizzes(prev => prev.filter(q => q.id !== quizId));
                }
            } catch (error) {
                console.error('Error deleting quiz:', error);
            }
        }
    };

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.topic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
        switch (sortBy) {
            case 'activity':
                return new Date(b.updated_at) - new Date(a.updated_at);
            case 'name':
                return a.topic.localeCompare(b.topic);
            case 'date':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'score':
                return (b.score || 0) - (a.score || 0);
            default:
                return 0;
        }
    });

    const sortOptions = [
        { value: 'activity', label: 'Activity' },
        { value: 'name', label: 'Name' },
        { value: 'date', label: 'Date Created' },
        { value: 'score', label: 'Score' }
    ];

    const getSortLabel = (value) => {
        return sortOptions.find(option => option.value === value)?.label || 'Sort by';
    };

    if (loading) {
        return (
            <div className="quizzes-page">
                <div className="quizzes-header">
                    <h1 className="quizzes-title">Quizzes</h1>
                </div>
                <div className="quizzes-grid">
                    <SkeletonQuizCard />
                    <SkeletonQuizCard />
                    <SkeletonQuizCard />
                    <SkeletonQuizCard />
                </div>
            </div>
        );
    }

    return (
        <div className="quizzes-page">
            <button onClick={() => navigate('/')} className="icon-button" aria-label="Home">
                <Home size={24} />
            </button>
            <div className="quizzes-header">
                <h1 className="quizzes-title">Quizzes</h1>
                <button className="new-quiz-btn" onClick={handleNewQuiz}>
                    <Plus size={18} />
                    New quiz
                </button>
            </div>

            <div className="quizzes-controls">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search quizzes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="quizzes-search-input"
                    />
                </div>

                <div className="sort-controls">
                    <div className="sort-dropdown" ref={sortRef}>
                        <button
                            className={`sort-dropdown-btn ${isSortOpen ? 'active' : ''}`}
                            onClick={() => setIsSortOpen(!isSortOpen)}
                        >
                            <ArrowUpDown size={16} className="sort-icon" />
                            <span className="sort-label">{getSortLabel(sortBy)}</span>
                            <ChevronDown size={16} className={`dropdown-icon ${isSortOpen ? 'rotate' : ''}`} />
                        </button>

                        {isSortOpen && (
                            <div className="sort-dropdown-menu">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`sort-option ${sortBy === option.value ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSortBy(option.value);
                                            setIsSortOpen(false);
                                        }}
                                    >
                                        <span>{option.label}</span>
                                        {sortBy === option.value && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="quizzes-content">
                {sortedQuizzes.length === 0 ? (
                    <div className="empty-state">
                        <img
                            src="/no-quizzes-doodle.svg"
                            alt="No quizzes illustration"
                            className="empty-illustration"
                        />
                        <p className="empty-description">
                            Start your first quiz to test your knowledge and track your progress
                        </p>
                        <button className="empty-cta-btn" onClick={() => navigate('/create-quiz')}>
                            <Plus size={18} />
                            Create your first quiz
                        </button>
                    </div>
                ) : (
                    <div className="quizzes-grid">
                        {sortedQuizzes.map((quiz) => (
                            <div
                                key={quiz.id}
                                className="quiz-card"
                                onClick={() => {
                                    const quizData = {
                                        topic: quiz.topic,
                                        type: quiz.type,
                                        difficulty: quiz.difficulty,
                                        mode: quiz.mode,
                                        questions: quiz.questions
                                    };
                                    // Navigate to correct page based on mode
                                    if (quiz.mode === 'full') {
                                        navigate(`/quiz-full/${quiz.id}`, { state: { quizData } });
                                    } else {
                                        navigate(`/quiz/${quiz.id}`, { state: { quizData } });
                                    }
                                }}
                            >
                                <div className="quiz-card-content">
                                    <div className="quiz-card-header">
                                        <h3 className="quiz-card-title">{quiz.topic}</h3>
                                        <div className="quiz-card-actions">
                                            {quiz.completed && quiz.score !== undefined && (
                                                <span
                                                    className={`quiz-score-badge ${Math.round((quiz.score / quiz.total_questions) * 100) >= 70
                                                        ? 'passed'
                                                        : 'failed'
                                                        }`}
                                                >
                                                    <CheckCircle size={12} />
                                                    {Math.round((quiz.score / quiz.total_questions) * 100)}%
                                                </span>
                                            )}
                                            <button
                                                className="quiz-delete-btn"
                                                onClick={(e) => handleDeleteQuiz(e, quiz.id)}
                                                aria-label="Delete quiz"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="quiz-card-meta">
                                        <span className="quiz-type-badge">{quiz.type}</span>
                                        <span className="quiz-difficulty-badge">{quiz.difficulty}</span>
                                        <span className="quiz-questions-count">{quiz.num_questions || quiz.questions?.length || 0} Questions</span>
                                    </div>
                                </div>
                                {quiz.completed ? (
                                    <div className="quiz-card-footer">
                                        <button
                                            className="quiz-action-btn view-results"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/quiz/${quiz.id}/results`, {
                                                    state: {
                                                        quizData: {
                                                            topic: quiz.topic,
                                                            type: quiz.type,
                                                            difficulty: quiz.difficulty,
                                                            questions: quiz.questions
                                                        },
                                                        userAnswers: quiz.answers || [],
                                                        score: quiz.score,
                                                        totalQuestions: quiz.total_questions
                                                    }
                                                });
                                            }}
                                        >
                                            <Eye size={14} />
                                            View Results
                                        </button>
                                        <button
                                            className="quiz-action-btn retake"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const quizData = {
                                                    topic: quiz.topic,
                                                    type: quiz.type,
                                                    difficulty: quiz.difficulty,
                                                    mode: quiz.mode,
                                                    questions: quiz.questions
                                                };
                                                if (quiz.mode === 'full') {
                                                    navigate(`/quiz-full/${quiz.id}`, { state: { quizData } });
                                                } else {
                                                    navigate(`/quiz/${quiz.id}`, { state: { quizData } });
                                                }
                                            }}
                                        >
                                            <RotateCcw size={14} />
                                            Retake
                                        </button>
                                    </div>
                                ) : (
                                    <span className="quiz-timestamp">
                                        {getRelativeTime(quiz.updated_at || quiz.created_at)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper function for relative time
const getRelativeTime = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return past.toLocaleDateString();
};

export default QuizzesPage;
