import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Layers, BarChart, Hash, HelpCircle, ArrowLeft, ChevronUp, ChevronDown, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CustomSelect from '../components/CustomSelect';
import { saveQuiz } from '../services/quizService';
import { generateQuizQuestions } from '../services/gemini';
import './CreateQuizPage.css';

const CreateQuizPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [formData, setFormData] = useState({
        topic: '',
        type: 'multiple-choice',
        difficulty: 'beginner',
        amount: 10,
        mode: 'card',
        customInstructions: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTrialModal, setShowTrialModal] = useState(false);

    const checkTrialLimit = () => {
        if (isAuthenticated) return true;

        const trialUsed = localStorage.getItem('guest_trial_used');
        if (trialUsed === 'true') {
            // You might want to show a modal or redirect to login here
            // For now, we'll just alert or handle it simply
            alert("Guest trial limit reached. Please login to continue.");
            navigate('/login');
            return false;
        }

        // Mark trial as used
        localStorage.setItem('guest_trial_used', 'true');
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!checkTrialLimit()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Generate quiz questions using AI
            console.log('Generating quiz with AI...', formData);

            const questions = await generateQuizQuestions({
                topic: formData.topic,
                quizType: formData.type,
                difficulty: formData.difficulty,
                numQuestions: parseInt(formData.amount),
                customInstructions: formData.customInstructions
            });

            console.log('AI Generated Questions:', questions);

            // Build quiz data object
            const quizData = {
                topic: formData.topic,
                type: formData.type === 'multiple-choice' ? 'Multiple Choice' :
                    formData.type === 'true-false' ? 'True/False' : 'Essay',
                difficulty: formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1),
                mode: formData.mode,
                numQuestions: questions.length,
                questions: questions
            };

            // Save quiz to database if user is authenticated
            let quizId = `ai-${Date.now()}`;
            console.log('Save check - isAuthenticated:', isAuthenticated, 'user:', user);

            if (isAuthenticated && user) {
                console.log('Attempting to save quiz for user:', user.id);
                const { data: savedQuiz, error: saveError } = await saveQuiz(user.id, quizData);
                if (!saveError && savedQuiz) {
                    quizId = savedQuiz.id;
                    console.log('Quiz saved successfully with ID:', quizId);
                } else {
                    console.error('Failed to save quiz:', saveError);
                }
            } else {
                console.log('Quiz not saved - user not authenticated');
            }

            // Navigate based on mode
            if (formData.mode === 'full') {
                navigate(`/quiz-full/${quizId}`, {
                    state: { quizData }
                });
            } else {
                navigate(`/quiz/${quizId}`, {
                    state: { quizData }
                });
            }
        } catch (err) {
            console.error('Error generating quiz:', err);
            setError(err.message || 'Failed to generate quiz. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="create-quiz-page">
            <div className="create-quiz-container">
                <div className="page-header">
                    <h1>Create a New Quiz</h1>
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
                        <CustomSelect
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            label="Quiz Type"
                            icon={Layers}
                            options={[
                                { value: 'multiple-choice', label: 'Multiple Choice' },
                                { value: 'true-false', label: 'True or False' },
                                { value: 'essay', label: 'Essay / Short Answer (Coming Soon)', disabled: true }
                            ]}
                        />

                        <CustomSelect
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            label="Difficulty Level"
                            icon={BarChart}
                            options={[
                                { value: 'beginner', label: 'Beginner' },
                                { value: 'intermediate', label: 'Intermediate' },
                                { value: 'advanced', label: 'Advanced' }
                            ]}
                        />
                    </div>

                    <div className="form-group">
                        <CustomSelect
                            name="mode"
                            value={formData.mode}
                            onChange={handleChange}
                            label="Quiz Mode"
                            icon={Layers}
                            options={[
                                { value: 'card', label: 'Card Mode (One at a time)' },
                                { value: 'full', label: 'Full Page (All questions)' }
                            ]}
                        />
                        <span className="input-hint mode-hint">
                            💡 <strong>Card Mode:</strong> Interactive learning with instant feedback. <strong>Full Page:</strong> Traditional quiz format.
                        </span>
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

                    <div className="form-group">
                        <label htmlFor="customInstructions">
                            <MessageSquare size={16} />
                            Custom Instructions <span className="optional-badge">(Optional)</span>
                        </label>
                        <textarea
                            id="customInstructions"
                            name="customInstructions"
                            value={formData.customInstructions}
                            onChange={handleChange}
                            placeholder="Add specific instructions for the AI, e.g.:&#10;• Focus on specific topics or chapters&#10;• Type of questions (conceptual, application-based)&#10;• Language preference&#10;• Any other preferences..."
                            className="form-textarea"
                            rows={4}
                        />
                        <span className="input-hint">Tell the AI exactly what you want in your quiz</span>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate(-1)}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-create"
                            disabled={isLoading || !formData.topic.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="spinning" />
                                    Generating...
                                </>
                            ) : (
                                'Create Quiz'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuizPage;
