// Helper function to call the Vercel Serverless Function
const callGeminiAPI = async (action, payload) => {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, payload }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Failed to call Gemini API:", error);
        throw error;
    }
};

export const generateExplanation = async (topic) => {
    try {
        const text = await callGeminiAPI('explanation', { topic });
        console.log("Gemini Raw Response:", text);

        const jsonMatch = text.match(/\[.*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : text;

        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.warn("JSON Parse failed, falling back to text", e);
            return [{
                title: "Explanation",
                content: text.replace(/```json/g, '').replace(/```/g, '')
            }];
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

        const jsonMatch = text.match(/\{.*\}/s);
        const jsonString = jsonMatch ? jsonMatch[0] : text;

        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return {
                title: "Clarification",
                content: text.replace(/```json/g, '').replace(/```/g, '')
            };
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

        const jsonMatch = text.match(/\[.*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : text;

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
