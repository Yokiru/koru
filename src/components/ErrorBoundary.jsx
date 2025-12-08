import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-content">
                        <div className="error-icon">⚠️</div>
                        <h1 className="error-title">Oops! Something went wrong</h1>
                        <p className="error-message">
                            Don't worry, this happens sometimes. Try refreshing the page.
                        </p>
                        <div className="error-actions">
                            <button className="error-btn primary" onClick={this.handleReload}>
                                Refresh Page
                            </button>
                            <button className="error-btn secondary" onClick={this.handleGoHome}>
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
