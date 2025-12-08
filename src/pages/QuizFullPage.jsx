import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, CheckCircle, XCircle } from 'lucide-react';
import './QuizFullPage.css';

const QuizFullPage = () => {
    const navigate = useNavigate();
    const { quizId } = useParams();
    const location = useLocation();

    const quizData = location.state?.quizData || {
        topic: 'Sample Quiz',
        type: 'Multiple Choice',
        difficulty: 'Intermediate',
        questions: []
    };

    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if all questions are answered
        const unanswered = quizData.questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            alert(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
            return;
        }

        setSubmitted(true);
        setShowResults(true);

        // Calculate score
        const userAnswers = quizData.questions.map(q => ({
            questionId: q.id,
            question: q.question,
            selectedAnswer: answers[q.id],
            correctAnswer: q.correctAnswer,
            isCorrect: answers[q.id] === q.correctAnswer,
            explanation: q.explanation || null
        }));

        const score = userAnswers.filter(a => a.isCorrect).length;

        // Navigate to results page
        setTimeout(() => {
            navigate(`/quiz/${quizId}/results`, {
                state: {
                    quizData,
                    userAnswers,
                    score,
                    totalQuestions: quizData.questions.length
                }
            });
        }, 1500);
    };

    const handleExit = () => {
        if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
            navigate('/quizzes');
        }
    };

    const getAnswerClass = (questionId, option) => {
        if (!submitted) {
            return answers[questionId] === option ? 'selected' : '';
        }

        const question = quizData.questions.find(q => q.id === questionId);
        if (option === question.correctAnswer) {
            return 'correct';
        }
        if (option === answers[questionId] && option !== question.correctAnswer) {
            return 'incorrect';
        }
        return '';
    };

    const progress = Object.keys(answers).length;
    const total = quizData.questions.length;
    const progressPercentage = total > 0 ? (progress / total) * 100 : 0;

    return (
        <div className="quiz-full-page">
            <button onClick={handleExit} className="icon-button exit-btn" aria-label="Exit Quiz">
                <X size={24} />
            </button>

            <div className="quiz-full-container">
                <div className="quiz-full-header">
                    <div className="quiz-info">
                        <h1 className="quiz-topic">{quizData.topic}</h1>
                        <div className="quiz-meta">
                            <span className="quiz-type-badge">{quizData.type}</span>
                            <span className="quiz-difficulty-badge">{quizData.difficulty}</span>
                            <span className="quiz-mode-badge">Full Page Mode</span>
                        </div>
                    </div>
                    <div className="quiz-progress-info">
                        <span className="question-counter">
                            {progress} of {total} answered
                        </span>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="quiz-full-form">
                    <div className="questions-list">
                        {quizData.questions.map((question, index) => (
                            <motion.div
                                key={question.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="question-card"
                            >
                                <div className="question-header">
                                    <span className="question-number">Question {index + 1}</span>
                                    {answers[question.id] && (
                                        <span className="answered-badge">
                                            <CheckCircle size={14} /> Answered
                                        </span>
                                    )}
                                </div>
                                <h3 className="question-text">{question.question}</h3>

                                <div className="options-grid">
                                    {question.options.map((option, optIndex) => (
                                        <label
                                            key={optIndex}
                                            className={`option-label ${getAnswerClass(question.id, option)}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                value={option}
                                                checked={answers[question.id] === option}
                                                onChange={() => handleAnswerChange(question.id, option)}
                                                disabled={submitted}
                                                className="option-radio"
                                            />
                                            <span className="option-letter">{String.fromCharCode(65 + optIndex)}</span>
                                            <span className="option-text">{option}</span>
                                            {submitted && option === question.correctAnswer && (
                                                <CheckCircle size={18} className="check-icon" />
                                            )}
                                            {submitted && option === answers[question.id] && option !== question.correctAnswer && (
                                                <XCircle size={18} className="x-icon" />
                                            )}
                                        </label>
                                    ))}
                                </div>

                                {submitted && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="question-explanation"
                                    >
                                        <strong>Explanation:</strong> {question.explanation}
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {!submitted && (
                        <div className="submit-section">
                            <button type="submit" className="submit-btn">
                                Submit Quiz
                            </button>
                            <p className="submit-hint">
                                Make sure you've answered all questions before submitting.
                            </p>
                        </div>
                    )}

                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="results-preview"
                        >
                            <p>Calculating your score...</p>
                        </motion.div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default QuizFullPage;
