import { loadEnv } from 'vite';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function apiServer() {
    return {
        name: 'api-server',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (!req.url.startsWith('/api/gemini')) {
                    return next();
                }

                console.log('📥 API request received:', req.url);

                try {
                    // 1. Setup Environment
                    const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
                    const API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

                    console.log('🔑 API Key available:', !!API_KEY);

                    if (!API_KEY) {
                        throw new Error('Missing Gemini API Key');
                    }

                    // 2. Polyfill Response Methods
                    res.status = (statusCode) => {
                        res.statusCode = statusCode;
                        return res;
                    };

                    res.json = (data) => {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(data));
                        return res;
                    };

                    // 3. Parse Body
                    let body = {};
                    if (req.method === 'POST') {
                        const buffers = [];
                        for await (const chunk of req) {
                            buffers.push(chunk);
                        }
                        const data = Buffer.concat(buffers).toString();
                        try {
                            body = JSON.parse(data);
                        } catch (e) {
                            console.error('Body parse error:', e);
                        }
                    }

                    // 4. Handle Gemini Logic Directly
                    const { action, payload } = body;
                    console.log('🤖 Action:', action);

                    const genAI = new GoogleGenerativeAI(API_KEY);
                    // Use gemini-2.0-flash as requested (cheap & good)
                    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

                    let prompt = "";
                    if (action === 'clarification') {
                        prompt = `
              You are an expert tutor explaining concepts to a student who is confused.
              
              Topic: "${payload.topic}"
              Student's Confusion: "${payload.confusion}"
              
              Provide a clear, simple explanation to clear up the confusion.
              Break it down into bite-sized parts if necessary.
              
              IMPORTANT: Write the response in the SAME language as the Topic.
              Do NOT use dual-language titles (e.g. "Title (Judul)"). Use ONLY the language of the topic.
              
              Return ONLY a JSON array of objects.
              Example format:
              [
                { "title": "Clarification Part 1", "content": "..." },
                { "title": "Clarification Part 2", "content": "..." }
              ]
              
              Keep the tone encouraging and simple.
              DO NOT use markdown formatting like \`\`\`json. Just return the raw JSON array.
            `;
                    } else if (action === 'quiz_feedback') {
                        prompt = `
              The user has just finished a quiz on "${payload.topic}".
              They answered ${payload.correct} out of ${payload.total} correctly.
              
              Generate a short, encouraging feedback message.
              If the score is low, suggest reviewing the material.
              If the score is high, congratulate them.
              
              IMPORTANT: Write the response in the SAME language as the Topic.
              
              Return ONLY a JSON object:
              { "feedback": "Your feedback message here" }
              
              DO NOT use markdown formatting like \`\`\`json. Just return the raw JSON object.
            `;
                    } else if (action === 'quiz') {
                        const quizType = payload.quizType || 'multiple-choice';
                        const difficulty = payload.difficulty || 'intermediate';
                        const numQuestions = payload.numQuestions || 5;
                        const topic = payload.topic;
                        const customInstructions = payload.customInstructions || '';

                        // Difficulty instruction
                        const difficultyInstructions = {
                            'beginner': 'Questions should be basic and straightforward, testing fundamental concepts.',
                            'intermediate': 'Questions should be moderately challenging, requiring good understanding of the topic.',
                            'advanced': 'Questions should be complex and challenging, testing deep knowledge and critical thinking.'
                        };

                        // Quiz type specific instructions
                        let typeInstructions = '';
                        let formatExample = '';

                        if (quizType === 'multiple-choice') {
                            typeInstructions = `
                                Generate MULTIPLE CHOICE questions.
                                Each question must have exactly 4 options labeled with actual answers (NOT A, B, C, D placeholders).
                                Only ONE option should be correct.
                                
                                IMPORTANT: Do NOT use "True", "False", "Benar", "Salah", or any true/false variations as options.
                                This is NOT a True/False quiz. Each option should be a unique, meaningful answer choice.
                            `;
                            formatExample = `
                                [
                                    {
                                        "id": 1,
                                        "question": "What is the capital of France?",
                                        "options": ["Paris", "London", "Berlin", "Madrid"],
                                        "correctAnswer": "Paris",
                                        "explanation": "Paris is the capital city of France."
                                    }
                                ]
                            `;
                        } else if (quizType === 'true-false') {
                            typeInstructions = `
                                Generate TRUE/FALSE questions.
                                Each question should be a STATEMENT that is either true or false.
                                Options must be exactly ["True", "False"] or the equivalent in the topic's language.
                            `;
                            formatExample = `
                                [
                                    {
                                        "id": 1,
                                        "question": "The Earth is the third planet from the Sun.",
                                        "options": ["True", "False"],
                                        "correctAnswer": "True",
                                        "explanation": "Earth is indeed the third planet from the Sun."
                                    }
                                ]
                            `;
                        } else if (quizType === 'essay') {
                            typeInstructions = `
                                Generate ESSAY/SHORT ANSWER questions.
                                These are open-ended questions requiring written responses.
                                No options needed - the options array should be empty [].
                                Provide a sampleAnswer instead of correctAnswer.
                            `;
                            formatExample = `
                                [
                                    {
                                        "id": 1,
                                        "question": "Explain the key concepts of...?",
                                        "options": [],
                                        "correctAnswer": null,
                                        "sampleAnswer": "A well-structured sample answer...",
                                        "explanation": "This question tests understanding of..."
                                    }
                                ]
                            `;
                        }

                        prompt = `
                            You are an expert quiz generator.
                            
                            Generate exactly ${numQuestions} quiz questions about "${topic}".
                            
                            QUIZ TYPE: ${quizType.toUpperCase()}
                            DIFFICULTY: ${difficulty.toUpperCase()}
                            
                            ${typeInstructions}
                            
                            Difficulty Guidelines:
                            ${difficultyInstructions[difficulty] || difficultyInstructions['intermediate']}
                            ${customInstructions ? `
                            USER'S CUSTOM INSTRUCTIONS (IMPORTANT - Follow these carefully):
                            ${customInstructions}
                            ` : ''}
                            IMPORTANT RULES:
                            1. Write questions in the SAME language as the Topic.
                            2. Each question must have a unique "id" starting from 1.
                            3. Questions should be clear and unambiguous.
                            4. Explanations should be concise but informative.
                            5. Correct answers must be accurate and verifiable.
                            6. RANDOMIZE the position of the correct answer! Do NOT always put the correct answer as the first option.
                               Mix it up - sometimes put correct answer in position 1, sometimes position 2, 3, or 4.
                            
                            Return ONLY a valid JSON array. NO markdown formatting.
                            
                            Example format:
                            ${formatExample}
                            
                            Generate ${numQuestions} questions now:
                        `;
                    } else {
                        // Default explanation - Multi-card format
                        prompt = `
              You are an expert teacher explaining "${payload.topic}" to a beginner.
              
              Break down the explanation into 3-5 distinct parts (cards) to make it easy to digest.
              Each part should have a clear title and a simple explanation.
              Use analogies and simple language ("baby language").
              
              IMPORTANT: Write the response in the SAME language as the Topic.
              Do NOT use dual-language titles (e.g. "Title (Judul)"). Use ONLY the language of the topic.
              
              Return ONLY a JSON array of objects.
              Example format:
              [
                { "title": "Introduction", "content": "..." },
                { "title": "How it works", "content": "..." },
                { "title": "Why it matters", "content": "..." }
              ]
              
              DO NOT use markdown formatting like \`\`\`json. Just return the raw JSON array.
            `;
                    }

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();

                    console.log('✅ Gemini Response received');
                    res.json({ text });

                } catch (err) {
                    console.error('❌ API Error:', err);
                    res.status(500).json({ error: 'Internal Server Error', details: err.message });
                }
            });
        },
    };
}
