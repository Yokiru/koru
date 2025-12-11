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
  // Use gemini-2.0-flash as requested (cheap & good)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  try {
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
    } else if (action === 'refine_title') {
      prompt = `
              You are a title refinement assistant.
              
              The user wants to create a quiz about: "${payload.topic}"
              
              Your task is to create a CLEANER, more CONCISE, and PROFESSIONAL title for this quiz.
              
              Rules:
              1. Keep the essence/meaning of the original topic
              2. Make it shorter if possible (max 50 characters ideal, max 80 characters absolute)
              3. Use proper capitalization (Title Case)
              4. Remove unnecessary words like "about", "regarding", "Quiz about", etc.
              5. Make it sound like a professional quiz topic title
              6. Write in the SAME language as the input
              7. If the input is already clean and short, just return it with proper capitalization
              
              Examples:
              - "apa itu bitcoin halving dan dampaknya pada pasar" → "Bitcoin Halving dan Dampaknya"
              - "machine learning basics and how it works" → "Machine Learning Basics"
              - "sejarah panjang kerajaan majapahit di indonesia" → "Sejarah Kerajaan Majapahit"
              - "basic javascript programming tutorial" → "JavaScript Programming Basics"
              
              Return ONLY a JSON object with the refined title:
              { "refinedTitle": "Your Refined Title Here" }
              
              DO NOT use markdown formatting. Just return the raw JSON object.
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
          
          IMPORTANT: Do NOT use "True" and "False" as options. This is NOT a True/False quiz.
          Each option should be a unique, meaningful answer choice.
          Options should be diverse and not just variations of true/false.
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
          Options must be exactly ["True", "False"].
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
              "sampleAnswer": "A well-structured sample answer explaining the topic...",
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

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: 'Failed to generate content', details: error.message });
  }
}
