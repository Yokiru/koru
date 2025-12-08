import React, { useState } from 'react';
import { X, BookOpen, Layers, BarChart, Hash, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import './CreateQuizModal.css';

const CreateQuizModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        topic: '',
        type: 'multiple-choice',
        difficulty: 'beginner',
        amount: 10
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="quiz-modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <h2>Create a New Quiz</h2>
                </div>

                <div className="instruction-block">
                    <div className="instruction-icon">
                        <HelpCircle size={20} />
                    </div>
                    <p>
                        Define your quiz specifications. The more detailed information you provide,
                        the more accurate the AI-generated quiz will be.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="quiz-form">
                    <div className="form-group">
                        <label htmlFor="topic">
                            <BookOpen size={16} />
                            Quiz Topic / Subject
                        </label>
                        <input
                            type="text"
                            id="topic"
                            name="topic"
                            value={formData.topic}
                            onChange={handleChange}
                            placeholder="Example: React Hooks Basic Concepts"
                            className="form-input"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="type">
                                <Layers size={16} />
                                Quiz Type
                            </label>
                            <div className="select-wrapper">
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="multiple-choice">Multiple Choice</option>
                                    <option value="essay">Essay / Short Answer</option>
                                    <option value="true-false">True or False</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="difficulty">
                                <BarChart size={16} />
                                Difficulty Level
                            </label>
                            <div className="select-wrapper">
                                <select
                                    id="difficulty"
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount">
                            <Hash size={16} />
                            Number of Questions
                        </label>
                        <div className="number-input-wrapper">
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                min="5"
                                max="50"
                                className="form-input number-input"
                                required
                            />
                            <div className="spinner-controls">
                                <button
                                    type="button"
                                    className="spinner-btn"
                                    onClick={() => {
                                        const newValue = Math.min(50, parseInt(formData.amount || 0) + 1);
                                        handleChange({ target: { name: 'amount', value: newValue } });
                                    }}
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    type="button"
                                    className="spinner-btn"
                                    onClick={() => {
                                        const newValue = Math.max(5, parseInt(formData.amount || 0) - 1);
                                        handleChange({ target: { name: 'amount', value: newValue } });
                                    }}
                                >
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>
                        <span className="input-hint">Min: 5, Max: 50</span>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-create">
                            Create Quiz
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuizModal;
