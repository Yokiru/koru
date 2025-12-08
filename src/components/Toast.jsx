import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import './Toast.css';

const Toast = () => {
    const { toasts, hideToast } = useToast();

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={18} />;
            case 'error':
                return <AlertCircle size={18} />;
            case 'warning':
                return <AlertTriangle size={18} />;
            default:
                return <Info size={18} />;
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                >
                    <div className="toast-icon">
                        {getIcon(toast.type)}
                    </div>
                    <span className="toast-message">{toast.message}</span>
                    <button
                        className="toast-close"
                        onClick={() => hideToast(toast.id)}
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Toast;
