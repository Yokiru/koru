/**
 * API Helper Utilities for Koru Application
 * 
 * Reusable functions for handling API responses,
 * particularly for parsing JSON from Gemini API responses.
 */

/**
 * Clean markdown code blocks from text
 * @param {string} text - Raw text potentially containing markdown code blocks
 * @returns {string} - Cleaned text without code block markers
 */
export const cleanMarkdownCodeBlocks = (text) => {
    if (!text || typeof text !== 'string') {
        return '';
    }
    return text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
};

/**
 * Extract JSON string from text that may contain other content
 * Prioritizes array format, falls back to object format
 * @param {string} text - Text containing JSON somewhere within it
 * @returns {string|null} - Extracted JSON string or null if not found
 */
export const extractJsonFromText = (text) => {
    if (!text || typeof text !== 'string') {
        return null;
    }

    // Try to match JSON array first (more common for our use case)
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
        return arrayMatch[0];
    }

    // Fall back to object match
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
        return objectMatch[0];
    }

    return null;
};

/**
 * Safely parse JSON with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} - Parsed JSON or fallback value
 */
export const safeJsonParse = (jsonString, fallback = null) => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.warn('JSON parse failed:', error.message);
        return fallback;
    }
};

/**
 * Parse JSON response from Gemini API
 * Handles markdown code blocks and extracts JSON
 * @param {string} rawText - Raw response text from Gemini
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} - Parsed data or fallback
 */
export const parseGeminiResponse = (rawText, fallback = null) => {
    if (!rawText) {
        return fallback;
    }

    // Step 1: Clean markdown code blocks
    const cleanedText = cleanMarkdownCodeBlocks(rawText);

    // Step 2: Extract JSON from text
    const jsonString = extractJsonFromText(cleanedText) || cleanedText;

    // Step 3: Parse JSON safely
    return safeJsonParse(jsonString, fallback);
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 * Used for randomizing quiz options
 * @param {Array} array - Array to shuffle
 * @returns {Array} - New shuffled array (does not mutate original)
 */
export const shuffleArray = (array) => {
    if (!Array.isArray(array)) {
        return [];
    }

    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Create a timeout promise for race conditions
 * @param {number} ms - Timeout in milliseconds
 * @param {string} message - Error message when timeout occurs
 * @returns {Promise} - Promise that rejects after timeout
 */
export const createTimeoutPromise = (ms, message = 'Request timeout') => {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), ms);
    });
};

/**
 * Wrap a promise with timeout
 * @param {Promise} promise - Promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @param {string} message - Error message when timeout occurs
 * @returns {Promise} - Promise that resolves/rejects based on race
 */
export const withTimeout = (promise, ms, message = 'Request timeout') => {
    return Promise.race([
        promise,
        createTimeoutPromise(ms, message)
    ]);
};
