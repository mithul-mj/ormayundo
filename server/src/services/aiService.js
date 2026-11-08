import Groq from 'groq-sdk';
import SystemConfig from '../models/systemConfig.js';
import { FLASHCARD_GENERATION_PROMPT } from '../utils/prompts.js';
import { SYSTEM_CONFIG_DEFAULTS, AI_CONSTANTS } from '../utils/constants.js';

const groq = new Groq({
  apiKey: process.env.AI_API_KEY
});

export const generateRecallQuestion = async (selectedText, userDecks = ['General'], sourceUrl = '') => {
  const decksList = Array.isArray(userDecks) && userDecks.length > 0 ? userDecks.join(', ') : 'General';
  
  // Smart input safeguard: clamp excessively long selections to configured max text length
  const maxAllowedLength = SYSTEM_CONFIG_DEFAULTS.MAX_TEXT_LENGTH;
  const clampedText = selectedText.length > maxAllowedLength 
    ? `${selectedText.slice(0, AI_CONSTANTS.TEXT_CLAMP_HEAD_CHARS)}\n\n[...]\n\n${selectedText.slice(-AI_CONSTANTS.TEXT_CLAMP_TAIL_CHARS)}` 
    : selectedText;

  const prompt = FLASHCARD_GENERATION_PROMPT
    .replace('{{DATA}}', clampedText)
    .replace('{{DECKS}}', decksList)
    .replace('{{URL}}', sourceUrl);

  const config = await SystemConfig.getSettings();
  const primaryModel = config.aiModel || SYSTEM_CONFIG_DEFAULTS.AI_MODEL;
  const fallbackModel = config.aiFallbackModel || SYSTEM_CONFIG_DEFAULTS.AI_FALLBACK_MODEL;
  const modelsToTry = [primaryModel];
  if (fallbackModel && fallbackModel !== primaryModel) {
    modelsToTry.push(fallbackModel);
  }
  const temperature = config.aiTemperature ?? SYSTEM_CONFIG_DEFAULTS.AI_TEMPERATURE;
  const maxCompletionTokens = config.aiMaxTokens ?? SYSTEM_CONFIG_DEFAULTS.AI_MAX_TOKENS;

  for (const model of modelsToTry) {
    try {
      console.log(`[AI] Sending request to Groq model: ${model} with decks: [${decksList}]...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_CONSTANTS.TIMEOUT_MS);

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature,
        max_completion_tokens: maxCompletionTokens,
        top_p: AI_CONSTANTS.DEFAULT_TOP_P,
        reasoning_effort: 'medium',
        stream: false,
        response_format: { type: 'json_object' },
        stop: null
      }, { signal: controller.signal });

      clearTimeout(timeoutId);
      console.log(`[AI] Received response from Groq (${model})!`);

      const rawContent = chatCompletion.choices[0]?.message?.content || '{}';
      // Strip markdown code fences if present (e.g. ```json ... ```)
      const sanitizedContent = rawContent
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(sanitizedContent);
      } catch (parseErr) {
        console.warn('[AI] JSON parse failed on output, attempting regex recovery:', parseErr.message);
        const questionMatch = sanitizedContent.match(/"question"\s*:\s*"([^"]+)"/i);
        const deckMatch = sanitizedContent.match(/"deck"\s*:\s*"([^"]+)"/i);
        parsed = {
          question: questionMatch ? questionMatch[1] : 'What is the key takeaway from this text?',
          deck: deckMatch ? deckMatch[1] : 'General'
        };
      }

      const usage = chatCompletion.usage || {};
      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || (promptTokens + completionTokens);

      return {
        question: parsed.question || 'What is the key takeaway from this text?',
        deck: parsed.deck || 'General',
        usage: {
          promptTokens,
          completionTokens,
          totalTokens
        },
        model
      };

    } catch (error) {
      console.warn(`[AI] Failed with model ${model}:`, error.message);
      if (model === modelsToTry[modelsToTry.length - 1]) {
        console.error("AI Generation Error (all models exhausted):", error);
        throw new Error('Failed to generate question from AI');
      }
    }
  }
};
