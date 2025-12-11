import { API_TIMEOUT_MS, MAX_RETRIES, RETRY_DELAY_MS } from '../utils/constants';
import { shuffleArray } from '../utils/apiHelpers';
import { isTimeoutError, isNetworkError, logError } from '../utils/errorHelpers';

// Helper function to call the Vercel Serverless Function with timeout and retry
const callGeminiAPI = async (action, payload, retryCount = 0) => {

    try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, payload }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        // Handle timeout
        if (isTimeoutError(error)) {
            logError('callGeminiAPI', error);

            // Retry once if this is the first attempt
            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying... (Attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                return callGeminiAPI(action, payload, retryCount + 1);
            }

            throw new Error("Request timeout. Please try again.");
        }

        // Handle network errors
        if (isNetworkError(error)) {
            logError('callGeminiAPI', error);
            throw new Error("Network error. Please check your connection.");
        }

        logError('callGeminiAPI', error);
        throw error;
    }

};

export const generateExplanation = async (topic) => {
    try {
        const text = await callGeminiAPI('explanation', { topic });
        console.log("Gemini Raw Response:", text);

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Match JSON array OR object (prioritize array if it looks like one)
        let jsonMatch = cleanText.match(/\[.*\]/s);
        if (!jsonMatch) {
            jsonMatch = cleanText.match(/\{.*\}/s);
        }
        const jsonString = jsonMatch ? jsonMatch[0] : cleanText;

        try {
            const data = JSON.parse(jsonString);

            // Case 1: Direct Array of Cards (New Multi-card format)
            if (Array.isArray(data)) {
                return {
                    cleanTopic: topic,
                    cards: data
                };
            }

            // Case 2: Legacy Object format { cleanTopic, cards }
            if (data.cleanTopic && Array.isArray(data.cards)) {
                return data;
            }

            // Case 3: Simple Object format { title, content }
            if (data.title && data.content) {
                return {
                    cleanTopic: topic,
                    cards: [{
                        title: data.title,
                        content: data.content
                    }]
                };
            }

            throw new Error("Invalid response format");
        } catch (e) {
            console.warn("JSON Parse failed, falling back to text", e);
            // Fallback structure
            return {
                cleanTopic: topic,
                cards: [{
                    title: "Explanation",
                    content: text.replace(/```json/g, '').replace(/```/g, '')
                }]
            };
        }
    } catch (error) {
        console.error("Error generating explanation:", error);
        throw error;
    }
};

export const generateClarification = async (topic, confusion) => {
    try {
        const text = await callGeminiAPI('clarification', { topic, confusion });
        console.log("Gemini Clarification Response:", text);

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Match JSON array or object
        const jsonMatch = cleanText.match(/(\[.*\]|\{.*\})/s);
        const jsonString = jsonMatch ? jsonMatch[0] : cleanText;

        try {
            const result = JSON.parse(jsonString);
            if (Array.isArray(result)) {
                return result;
            } else if (typeof result === 'object') {
                return [result];
            }
            throw new Error("Invalid format");
        } catch (e) {
            return [{
                title: "Clarification",
                content: text.replace(/```json/g, '').replace(/```/g, '')
            }];
        }
    } catch (error) {
        console.error("Error generating clarification:", error);
        throw error;
    }
};

export const generateQuizQuestions = async ({ topic, quizType = 'multiple-choice', difficulty = 'intermediate', numQuestions = 5, customInstructions = '' }) => {
    try {
        const text = await callGeminiAPI('quiz', {
            topic,
            quizType,
            difficulty,
            numQuestions,
            customInstructions
        });
        console.log("Gemini Quiz Response:", text);

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const jsonMatch = cleanText.match(/\[.*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : cleanText;

        try {
            const questions = JSON.parse(jsonString);
            if (Array.isArray(questions) && questions.length > 0) {
                // Process each question to ensure id and shuffle options
                return questions.map((q, index) => {
                    // Only shuffle if it's multiple choice (has 4 options)
                    if (q.options && q.options.length === 4 && q.correctAnswer) {
                        const shuffledOptions = shuffleArray(q.options);
                        return {
                            ...q,
                            id: q.id || index + 1,
                            options: shuffledOptions
                            // correctAnswer stays the same - it's the value, not the position
                        };
                    }
                    return {
                        ...q,
                        id: q.id || index + 1
                    };
                });
            }
            throw new Error("Invalid quiz format");
        } catch (e) {
            console.warn("Quiz JSON parse failed", e);
            // Return fallback based on quiz type
            if (quizType === 'true-false') {
                return [{
                    id: 1,
                    question: `Statement about ${topic}`,
                    options: ["True", "False"],
                    correctAnswer: "True",
                    explanation: "This is a fallback question due to parsing error."
                }];
            } else if (quizType === 'essay') {
                return [{
                    id: 1,
                    question: `Explain the key concepts of ${topic}.`,
                    options: [],
                    correctAnswer: null,
                    sampleAnswer: "Please provide a detailed explanation.",
                    explanation: "This is a fallback question due to parsing error."
                }];
            } else {
                return [{
                    id: 1,
                    question: `What is the main concept of ${topic}?`,
                    options: ["Option A", "Option B", "Option C", "Option D"],
                    correctAnswer: "Option A",
                    explanation: "This is a fallback question due to parsing error."
                }];
            }
        }
    } catch (error) {
        console.error("Error generating quiz questions:", error);
        throw error;
    }
};

/**
 * Refine and improve a quiz title using AI
 * @param {string} topic - The original topic/title entered by user
 * @returns {Promise<string>} - Refined/improved title
 */
export const refineQuizTitle = async (topic) => {
    try {
        const text = await callGeminiAPI('refine_title', { topic });
        console.log("Gemini Refine Title Response:", text);

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Match JSON object
        const jsonMatch = cleanText.match(/\{.*\}/s);
        const jsonString = jsonMatch ? jsonMatch[0] : cleanText;

        try {
            const result = JSON.parse(jsonString);
            if (result.refinedTitle) {
                return result.refinedTitle;
            }
            // Fallback to original if no refinedTitle
            return topic;
        } catch (e) {
            console.warn("Refine title JSON parse failed, returning original", e);
            return topic;
        }
    } catch (error) {
        console.error("Error refining quiz title:", error);
        // Return original topic if refining fails
        return topic;
    }
};
