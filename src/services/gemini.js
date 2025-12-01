// Helper function to call the Vercel Serverless Function with timeout and retry
const callGeminiAPI = async (action, payload, retryCount = 0) => {
    const MAX_RETRIES = 1;
    const TIMEOUT_MS = 30000; // 30 seconds

    try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

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
        if (error.name === 'AbortError') {
            console.error("Request timeout after 30 seconds");

            // Retry once if this is the first attempt
            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying... (Attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                return callGeminiAPI(action, payload, retryCount + 1);
            }

            throw new Error("Request timeout. Please try again.");
        }

        // Handle network errors
        if (error.message.includes('Failed to fetch')) {
            throw new Error("Network error. Please check your connection.");
        }

        console.error("Failed to call Gemini API:", error);
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

export const generateQuizQuestions = async (topic, numQuestions = 3) => {
    try {
        const text = await callGeminiAPI('quiz', { topic, numQuestions });
        console.log("Gemini Quiz Response:", text);

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const jsonMatch = cleanText.match(/\[.*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : cleanText;

        try {
            const questions = JSON.parse(jsonString);
            if (Array.isArray(questions) && questions.length > 0) {
                return questions;
            }
            throw new Error("Invalid quiz format");
        } catch (e) {
            console.warn("Quiz JSON parse failed", e);
            return [{
                question: `What is the main concept of ${topic}?`,
                type: "true_false",
                options: ["True", "False"],
                correctAnswer: "True",
                explanation: "This is a basic understanding check."
            }];
        }
    } catch (error) {
        console.error("Error generating quiz questions:", error);
        throw error;
    }
};
