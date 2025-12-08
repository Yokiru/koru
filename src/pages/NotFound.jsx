import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-page">
            <div className="not-found-content">
                <div className="not-found-code">404</div>
                <h1 className="not-found-title">Page not found</h1>
                <p className="not-found-message">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="not-found-actions">
                    <button className="not-found-btn primary" onClick={() => navigate('/')}>
                        <Home size={18} />
                        Go to Home
                    </button>
                    <button className="not-found-btn secondary" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
