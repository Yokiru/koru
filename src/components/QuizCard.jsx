import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import './QuizCard.css';

const QuizCard = ({ question, type, options, correctAnswer, explanation, onAnswer }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [shake, setShake] = useState(false);

    const triggerConfetti = () => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
                spread: 90,
                startVelocity: 45,
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    };

    const handleAnswerSelect = (option) => {
        if (showFeedback) return; // Prevent changing answer after submission

        setSelectedAnswer(option);
        setShowFeedback(true);

        const isCorrect = option === correctAnswer;

        if (isCorrect) {
            // Trigger confetti for correct answer
            setTimeout(() => triggerConfetti(), 100);
        } else {
            // Trigger shake for incorrect answer
            setShake(true);
            setTimeout(() => setShake(false), 650);
        }

        // Notify parent component
        if (onAnswer) {
            onAnswer(isCorrect);
        }
    };

    const getButtonClass = (option) => {
        if (!showFeedback) {
            return selectedAnswer === option ? 'selected' : '';
        }

        if (option === correctAnswer) {
            return 'correct';
        }

        if (option === selectedAnswer && option !== correctAnswer) {
            return 'incorrect';
        }

        return '';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`quiz-card ${shake ? 'shake' : ''}`}
        >
            <div className="quiz-question">
                <h3>{question}</h3>
                <span className="quiz-type-badge">
                    {type === 'multiple_choice' ? 'Multiple Choice' : 'True/False'}
                </span>
            </div>

            <div className="quiz-options">
                {Array.isArray(options) && options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={`quiz-option ${getButtonClass(option)}`}
                        disabled={showFeedback}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {showFeedback && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`quiz-feedback ${selectedAnswer === correctAnswer ? 'correct-feedback' : 'incorrect-feedback'}`}
                >
                    <div className="feedback-header">
                        {selectedAnswer === correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
                    </div>
                    <div className="feedback-explanation">
                        <strong>Explanation:</strong> {explanation}
                    </div>
                    {selectedAnswer !== correctAnswer && (
                        <div className="correct-answer-info">
                            <strong>Correct answer:</strong> {correctAnswer}
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default QuizCard;
