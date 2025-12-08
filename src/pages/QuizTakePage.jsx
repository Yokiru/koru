import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import './QuizTakePage.css';

const QuizTakePage = () => {
    const navigate = useNavigate();
    const { quizId } = useParams();
    const location = useLocation();

    // Get quiz data from location state or fetch from database
    const quizData = location.state?.quizData || {
        topic: 'Sample Quiz - True or False',
        type: 'True or False',
        difficulty: 'Beginner',
        questions: [
            {
                id: 1,
                question: 'The Earth is the third planet from the Sun.',
                options: ['True', 'False'],
                correctAnswer: 'True',
                explanation: 'Earth is indeed the third planet from the Sun, after Mercury and Venus.'
            },
            {
                id: 2,
                question: 'Water boils at 50 degrees Celsius at sea level.',
                options: ['True', 'False'],
                correctAnswer: 'False',
                explanation: 'Water boils at 100 degrees Celsius (212°F) at sea level, not 50 degrees.'
            },
            {
                id: 3,
                question: 'The Great Wall of China is visible from space with the naked eye.',
                options: ['True', 'False'],
                correctAnswer: 'False',
                explanation: 'This is a common myth. The Great Wall is too narrow to be seen from space without aid.'
            },
            {
                id: 4,
                question: 'Honey never spoils.',
                options: ['True', 'False'],
                correctAnswer: 'True',
                explanation: 'Honey has natural preservatives and can last indefinitely if stored properly. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.'
            },
            {
                id: 5,
                question: 'Lightning never strikes the same place twice.',
                options: ['True', 'False'],
                correctAnswer: 'False',
                explanation: 'This is a myth. Lightning can and often does strike the same place multiple times, especially tall structures like the Empire State Building.'
            }
        ]
    };

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [essayAnswer, setEssayAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [shake, setShake] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);
    const [score, setScore] = useState(0);

    const isEssay = quizData.type === 'Essay';

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const totalQuestions = quizData.questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const triggerConfetti = () => {
        const count = 200;
        const defaults = { origin: { y: 0.7 } };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
                spread: 90,
                startVelocity: 45,
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    };

    const handleAnswerSelect = (option) => {
        if (showFeedback) return;

        setSelectedAnswer(option);
        setShowFeedback(true);

        const isCorrect = option === currentQuestion.correctAnswer;

        if (isCorrect) {
            setScore(prev => prev + 1);
            setTimeout(() => triggerConfetti(), 100);
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 650);
        }

        setUserAnswers(prev => [...prev, {
            questionId: currentQuestion.id,
            question: currentQuestion.question,
            selectedAnswer: option,
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect,
            explanation: currentQuestion.explanation || null
        }]);
    };

    // Handle essay answer submit
    const handleEssaySubmit = () => {
        if (!essayAnswer.trim()) return;

        setShowFeedback(true);
        setUserAnswers(prev => [...prev, {
            questionId: currentQuestion.id,
            question: currentQuestion.question,
            selectedAnswer: essayAnswer,
            sampleAnswer: currentQuestion.sampleAnswer,
            isEssay: true
        }]);
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setEssayAnswer('');
            setShowFeedback(false);
        } else {
            // For essay, add the last answer
            const finalAnswers = isEssay ? [...userAnswers, {
                questionId: currentQuestion.id,
                question: currentQuestion.question,
                selectedAnswer: essayAnswer,
                sampleAnswer: currentQuestion.sampleAnswer,
                isEssay: true
            }] : [...userAnswers, {
                questionId: currentQuestion.id,
                question: currentQuestion.question,
                selectedAnswer,
                correctAnswer: currentQuestion.correctAnswer,
                isCorrect: selectedAnswer === currentQuestion.correctAnswer
            }];

            // Navigate to results page
            navigate(`/quiz/${quizId}/results`, {
                state: {
                    quizData,
                    userAnswers: finalAnswers,
                    score: isEssay ? null : (selectedAnswer === currentQuestion.correctAnswer ? score + 1 : score),
                    totalQuestions
                }
            });
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
        }
    };

    const handleExit = () => {
        if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
            navigate('/quizzes');
        }
    };

    const getButtonClass = (option) => {
        if (!showFeedback) {
            return selectedAnswer === option ? 'selected' : '';
        }

        if (option === currentQuestion.correctAnswer) {
            return 'correct';
        }

        if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
            return 'incorrect';
        }

        return '';
    };

    return (
        <div className="quiz-take-page">
            <button onClick={handleExit} className="icon-button exit-btn" aria-label="Exit Quiz">
                <X size={24} />
            </button>

            <div className="quiz-header">
                <div className="quiz-info">
                    <h1 className="quiz-topic">{quizData.topic}</h1>
                    <div className="quiz-meta">
                        <span className="quiz-type-badge">{quizData.type}</span>
                        <span className="quiz-difficulty-badge">{quizData.difficulty}</span>
                    </div>
                </div>
                <div className="quiz-progress-info">
                    <span className="question-counter">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="quiz-content">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className={`quiz-card ${shake ? 'shake' : ''}`}
                    >
                        <div className="quiz-question">
                            <h2>{currentQuestion.question}</h2>
                        </div>

                        {/* Essay Type - Show textarea */}
                        {isEssay ? (
                            <div className="essay-input-container">
                                <textarea
                                    className="essay-textarea"
                                    placeholder="Write your answer here..."
                                    value={essayAnswer}
                                    onChange={(e) => setEssayAnswer(e.target.value)}
                                    disabled={showFeedback}
                                    rows={6}
                                />
                                {!showFeedback && (
                                    <button
                                        className="essay-submit-btn"
                                        onClick={handleEssaySubmit}
                                        disabled={!essayAnswer.trim()}
                                    >
                                        Submit Answer
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* Multiple Choice / True-False - Show option buttons */
                            <div className="quiz-options">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerSelect(option)}
                                        className={`quiz-option ${getButtonClass(option)}`}
                                        disabled={showFeedback}
                                    >
                                        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                        <span className="option-text">{option}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`quiz-feedback ${isEssay ? 'essay-feedback' : (selectedAnswer === currentQuestion.correctAnswer ? 'correct-feedback' : 'incorrect-feedback')}`}
                            >
                                <div className="feedback-header">
                                    {isEssay ? '📝 Answer Submitted' : (selectedAnswer === currentQuestion.correctAnswer ? '✓ Correct!' : '✗ Incorrect')}
                                </div>
                                {isEssay ? (
                                    <div className="sample-answer-info">
                                        <strong>Sample Answer:</strong> {currentQuestion.sampleAnswer}
                                    </div>
                                ) : (
                                    <>
                                        <div className="feedback-explanation">
                                            <strong>Explanation:</strong> {currentQuestion.explanation}
                                        </div>
                                        {selectedAnswer !== currentQuestion.correctAnswer && (
                                            <div className="correct-answer-info">
                                                <strong>Correct answer:</strong> {currentQuestion.correctAnswer}
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <footer className="quiz-footer">
                <button
                    onClick={handleBack}
                    className="nav-button"
                    disabled={currentQuestionIndex === 0}
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="question-indicators">
                    {quizData.questions.map((_, idx) => (
                        <div
                            key={idx}
                            className={`indicator ${idx === currentQuestionIndex ? 'active' : ''} ${idx < currentQuestionIndex ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="nav-button primary"
                    disabled={!showFeedback}
                >
                    {currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Finish'}
                    <ArrowRight size={20} />
                </button>
            </footer>
        </div>
    );
};

export default QuizTakePage;
