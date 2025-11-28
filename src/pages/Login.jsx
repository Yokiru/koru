import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }

        const { success, error: loginError } = await login(formData.email, formData.password);

        if (success) {
            navigate('/');
        } else {
            setError(loginError?.message || 'Failed to login. Please check your credentials.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header-outside">
                <h1 className="auth-logo-large">Welcome to Nue</h1>
                <p className="auth-subtitle-large">Sign in to continue your learning journey</p>
            </div>

            <div className="auth-card">
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        disabled={loading}
                        autoComplete="email"
                        className="auth-input"
                    />

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        disabled={loading}
                        autoComplete="current-password"
                        className="auth-input"
                    />

                    <button
                        type="submit"
                        className="auth-button primary"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Continue with email'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
