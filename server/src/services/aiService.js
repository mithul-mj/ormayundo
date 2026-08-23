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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-120b',
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      reasoning_effort: 'medium',
      stream: false,
      response_format: { type: 'json_object' },
      stop: null
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
