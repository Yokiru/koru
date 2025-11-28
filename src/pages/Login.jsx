import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

import { supabase } from '../services/supabase';

const Login = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuth();
    console.log('Login render: loading =', loading);

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

    const checkConnection = async () => {
        console.log('Checking connection...');
        try {
            const { count, error } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            console.log('Connection check passed:', count);
            alert('Connection to Supabase is OK! ✅');
        } catch (err) {
            console.error('Connection check failed:', err);
            alert(`Connection Failed ❌: ${err.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login submit');
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }

        console.log('Calling login function...');
        const { success, error: loginError } = await login(formData.email, formData.password);
        console.log('Login function returned:', { success, loginError });

        if (success) {
            console.log('Navigating to /');
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
                    <button
                        type="button"
                        onClick={checkConnection}
                        className="text-xs text-gray-500 hover:text-gray-300 mb-4 underline"
                    >
                        Check Connection
                    </button>
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
