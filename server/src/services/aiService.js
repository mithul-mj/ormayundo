import Groq from 'groq-sdk';
const groq = new Groq({
  apiKey: process.env.AI_API_KEY
});

export const generateRecallQuestion = async (selectedText) => {
  const prompt = `
    You are an expert learning assistant specializing in active recall.
    Your task is to create exactly ONE high-quality active-recall question from the provided text.
    
    Rules:
    1. Generate exactly one question.
    2. The question must test the most important information in the text.
    3. Do not create yes/no questions.
    4. Return ONLY a valid JSON object in this exact format:
    {
      "question": "string"
    }

    Text:
    "${selectedText}"
  `;

  try {
    console.log('[AI] Sending request to Groq...');

    // Set a 30 second timeout for the API call to give Qwen enough time
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'qwen/qwen3.6-27b',
      temperature: 0.3,
      response_format: { type: 'json_object' }
    }, { signal: controller.signal });

    clearTimeout(timeoutId);
    console.log('[AI] Received response from Groq!');

    const responseContent = chatCompletion.choices[0]?.message?.content;
    const parsed = JSON.parse(responseContent);
    return parsed.question;

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error('Failed to generate question from AI');
  }
};
