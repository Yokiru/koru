import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, payload } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  console.log('🔑 API Key check:', { hasKey: !!API_KEY, keyLength: API_KEY?.length });

  if (!API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    let prompt = "";

    if (action === 'explanation') {
      const { topic } = payload;
      prompt = `
              IMPORTANT: Detect the language of the user's input and respond in THE SAME LANGUAGE.
              If the user writes in Indonesian, respond in Indonesian.
              If the user writes in English, respond in English.
              If the user writes in any other language, respond in that language.
              
              Explain "${topic}" in a simple, engaging way for a learner. 
              Break it down into 3-5 distinct parts or steps.
              
              Return ONLY a JSON object with the following structure:
              {
                "cleanTopic": "A concise, title-cased version of the topic (e.g. 'Quantum Physics' or 'Fisika Kuantum' depending on input language)",
                "cards": [
                    { "title": "Introduction", "content": "..." },
                    { "title": "Key Concept", "content": "..." }
                ]
              }
              
              CRITICAL: All content in the JSON (cleanTopic, title, content) MUST be in the SAME LANGUAGE as the user's input "${topic}".
              Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
            `;
    } else if (action === 'clarification') {
      const { topic, confusion } = payload;
      prompt = `
              IMPORTANT: Detect the language of the user's input and respond in THE SAME LANGUAGE.
              If the user writes in Indonesian, respond in Indonesian.
              If the user writes in English, respond in English.
              
              The user is learning about "${topic}" and is confused about: "${confusion}".
              Provide a specific clarification to help them understand.
              
              If the answer is short, provide 1 card.
              If the answer is long or complex, break it into 2-3 cards to make it easier to read.
              
              Return ONLY a JSON array of objects.
              Example format:
              [
                { "title": "Clarification Part 1", "content": "..." },
                { "title": "Clarification Part 2", "content": "..." }
              ]
              
              CRITICAL: Both "title" and "content" MUST be in the SAME LANGUAGE as the user's confusion "${confusion}".
              Do not include markdown formatting. Just the raw JSON array.
            `;
    } else if (action === 'quiz') {
      const { topic, numQuestions } = payload;
      prompt = `
              IMPORTANT: Detect the language of the user's input and respond in THE SAME LANGUAGE.
              If the user writes in Indonesian, respond in Indonesian.
              If the user writes in English, respond in English.
              
              Create ${numQuestions || 3} quiz questions about "${topic}" for a learner.
              Mix multiple choice and true/false questions.
              Return ONLY a JSON array of question objects.
              Each object must have:
              - "question": the question text
              - "type": either "multiple_choice" or "true_false"
              - "options": array of answer options (4 for multiple choice, 2 for true/false: ["True", "False"] or ["Benar", "Salah"] depending on language)
              - "correctAnswer": the correct option (exact match from options array)
              - "explanation": brief explanation of why the answer is correct
              
              Example format:
              [
                {
                  "question": "What is photosynthesis?",
                  "type": "multiple_choice",
                  "options": ["A process plants use to make food", "A type of cell", "A chemical reaction", "An animal behavior"],
                  "correctAnswer": "A process plants use to make food",
                  "explanation": "Photosynthesis is the process by which plants convert light energy into chemical energy (food)."
                }
              ]
              
              CRITICAL: All text in the JSON (question, options, correctAnswer, explanation) MUST be in the SAME LANGUAGE as the user's topic "${topic}".
              Do not include markdown formatting. Just the raw JSON array.
            `;
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: 'Failed to generate content' });
  }
}
