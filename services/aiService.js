/**
 * AI Service - Handles quiz generation using Google Gemini API
 */
import { QUESTION_TYPES } from '../utils/constants';

// Use the secure Environment Variable (EXPO_PUBLIC_ prefix for client access)
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

/**
 * Generate a quiz based on a topic and question count
 * @param {string} topic - The subject of the quiz
 * @param {number} count - How many questions to generate
 * @param {string} difficulty - easy, medium, hard
 * @returns {Array} - List of formatted question objects
 */
export async function generateAIQuiz(topic, count = 5, difficulty = 'medium') {
  if (!topic) throw new Error("Topic is required");

  const prompt = `Generate a ${difficulty} difficulty quiz about "${topic}" with exactly ${count} questions. 
  Return the response as a valid JSON array of objects. 
  Each object must have these exact fields:
  - "text": The question string
  - "type": Always use "single"
  - "options": An array of exactly 4 strings
  - "correctAnswer": The index (0, 1, 2, or 3) of the correct option in the options array.
  
  Do not include any markdown formatting like \`\`\`json or explanations. Return ONLY the raw JSON array.`;

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "AI Generation failed");
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Clean potential markdown artifacts if AI ignores instructions
    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const questions = JSON.parse(cleanJson);
    
    // Validate and format for SecureQuiz
    return questions.map((q, i) => ({
      id: `ai_q${i+1}`,
      text: q.text,
      type: QUESTION_TYPES.SINGLE,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));

  } catch (e) {
    console.error("AI Service Error:", e);
    throw e;
  }
}
