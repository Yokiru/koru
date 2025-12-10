/**
 * Centralized Constants for Koru Application
 * 
 * This file contains all magic numbers and configuration values
 * used throughout the application. Centralizing these values makes
 * it easier to maintain and update them.
 */

// ============================================
// API Configuration
// ============================================

/** Default timeout for API requests in milliseconds */
export const API_TIMEOUT_MS = 30000;

/** Timeout for authentication operations in milliseconds */
export const AUTH_TIMEOUT_MS = 10000;

/** Timeout for user session operations in milliseconds */
export const SESSION_TIMEOUT_MS = 5000;

/** Timeout for profile loading in milliseconds */
export const PROFILE_TIMEOUT_MS = 2000;

/** Maximum number of retry attempts for failed API calls */
export const MAX_RETRIES = 1;

/** Delay between retry attempts in milliseconds */
export const RETRY_DELAY_MS = 1000;

// ============================================
// UI Limits
// ============================================

/** Maximum number of pinned history items */
export const MAX_PINNED_ITEMS = 5;

/** Maximum number of history items to display */
export const MAX_HISTORY_ITEMS = 15;

/** Maximum number of suggestions to show on home page */
export const MAX_SUGGESTIONS = 5;

/** Minimum number of quiz questions */
export const MIN_QUIZ_QUESTIONS = 5;

/** Maximum number of quiz questions */
export const MAX_QUIZ_QUESTIONS = 50;

// ============================================
// Storage Keys
// ============================================

/** LocalStorage key for user profile cache */
export const STORAGE_KEY_PROFILE = 'koru_user_profile';

/** LocalStorage key for guest trial status */
export const STORAGE_KEY_TRIAL = 'guest_trial_used';

/** SessionStorage key for home greeting */
export const STORAGE_KEY_GREETING = 'home_greeting';

/** SessionStorage key for home greeting cache key */
export const STORAGE_KEY_GREETING_KEY = 'home_greeting_key';

/** SessionStorage key for home suggestions */
export const STORAGE_KEY_SUGGESTIONS = 'home_suggestions';

// ============================================
// Quiz Types
// ============================================

export const QUIZ_TYPES = {
    MULTIPLE_CHOICE: 'multiple-choice',
    TRUE_FALSE: 'true-false',
    ESSAY: 'essay',
};

// ============================================
// Difficulty Levels
// ============================================

export const DIFFICULTY_LEVELS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
};

// ============================================
// Auth Routes (for hiding sidebar)
// ============================================

export const AUTH_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
];
