import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './QuizCard.css';

const QuizCard = ({ question, type, options, correctAnswer, explanation, onAnswer }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const handleAnswerSelect = (option) => {
        if (showFeedback) return; // Prevent changing answer after submission

        setSelectedAnswer(option);
        setShowFeedback(true);

        const isCorrect = option === correctAnswer;

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
            className="quiz-card"
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
