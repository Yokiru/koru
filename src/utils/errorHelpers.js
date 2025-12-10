/**
 * Error Handling Utilities for Koru Application
 * 
 * Standardized error handling functions for consistent
 * error messages and user-friendly feedback.
 */

/**
 * Error types enum for categorization
 */
export const ErrorTypes = {
    NETWORK: 'NETWORK',
    TIMEOUT: 'TIMEOUT',
    AUTH: 'AUTH',
    VALIDATION: 'VALIDATION',
    API: 'API',
    UNKNOWN: 'UNKNOWN',
};

/**
 * Check if error is a network error
 * @param {Error} error - Error object to check
 * @returns {boolean} - True if network error
 */
export const isNetworkError = (error) => {
    if (!error) return false;

    const message = error.message?.toLowerCase() || '';
    return (
        message.includes('failed to fetch') ||
        message.includes('network') ||
        message.includes('net::') ||
        error.name === 'TypeError' && message.includes('fetch')
    );
};

/**
 * Check if error is a timeout error
 * @param {Error} error - Error object to check
 * @returns {boolean} - True if timeout error
 */
export const isTimeoutError = (error) => {
    if (!error) return false;

    return (
        error.name === 'AbortError' ||
        error.message?.toLowerCase().includes('timeout')
    );
};

/**
 * Check if error is an authentication error
 * @param {Error} error - Error object to check
 * @returns {boolean} - True if auth error
 */
export const isAuthError = (error) => {
    if (!error) return false;

    const message = error.message?.toLowerCase() || '';
    return (
        message.includes('unauthorized') ||
        message.includes('unauthenticated') ||
        message.includes('invalid credentials') ||
        message.includes('session expired') ||
        error.status === 401 ||
        error.status === 403
    );
};

/**
 * Categorize an error by type
 * @param {Error} error - Error to categorize
 * @returns {string} - Error type from ErrorTypes enum
 */
export const categorizeError = (error) => {
    if (isNetworkError(error)) return ErrorTypes.NETWORK;
    if (isTimeoutError(error)) return ErrorTypes.TIMEOUT;
    if (isAuthError(error)) return ErrorTypes.AUTH;
    if (error?.status >= 400 && error?.status < 500) return ErrorTypes.VALIDATION;
    if (error?.status >= 500) return ErrorTypes.API;
    return ErrorTypes.UNKNOWN;
};

/**
 * Get user-friendly error message based on error type
 * @param {Error} error - Error object
 * @param {string} language - Language code ('en' or 'id')
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error, language = 'en') => {
    const errorType = categorizeError(error);

    const messages = {
        en: {
            [ErrorTypes.NETWORK]: 'Network error. Please check your connection.',
            [ErrorTypes.TIMEOUT]: 'Request timeout. Please try again.',
            [ErrorTypes.AUTH]: 'Authentication failed. Please sign in again.',
            [ErrorTypes.VALIDATION]: 'Invalid input. Please check your data.',
            [ErrorTypes.API]: 'Server error. Please try again later.',
            [ErrorTypes.UNKNOWN]: 'Something went wrong. Please try again.',
        },
        id: {
            [ErrorTypes.NETWORK]: 'Kesalahan jaringan. Periksa koneksi Anda.',
            [ErrorTypes.TIMEOUT]: 'Waktu habis. Silakan coba lagi.',
            [ErrorTypes.AUTH]: 'Autentikasi gagal. Silakan masuk kembali.',
            [ErrorTypes.VALIDATION]: 'Input tidak valid. Periksa data Anda.',
            [ErrorTypes.API]: 'Kesalahan server. Silakan coba lagi nanti.',
            [ErrorTypes.UNKNOWN]: 'Terjadi kesalahan. Silakan coba lagi.',
        },
    };

    const lang = messages[language] ? language : 'en';
    return messages[lang][errorType] || messages[lang][ErrorTypes.UNKNOWN];
};

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {string} type - Error type from ErrorTypes
 * @param {*} originalError - Original error object for debugging
 * @returns {Object} - Standardized error object
 */
export const createAppError = (message, type = ErrorTypes.UNKNOWN, originalError = null) => {
    return {
        message,
        type,
        timestamp: new Date().toISOString(),
        original: originalError,
    };
};

/**
 * Log error with consistent format
 * @param {string} context - Where the error occurred (e.g., 'AuthService.signIn')
 * @param {Error} error - Error object
 */
export const logError = (context, error) => {
    const errorType = categorizeError(error);
    console.error(`[${context}] ${errorType}:`, error?.message || error);

    // In development, log full error
    if (process.env.NODE_ENV === 'development' && error) {
        console.error('Full error:', error);
    }
};
