import Groq from 'groq-sdk';
import SystemConfig from '../models/systemConfig.js';
import { getAvailableSlots, markSlotCooldown } from './apiKeyManager.js';
import { FLASHCARD_GENERATION_PROMPT } from '../utils/prompts.js';
import { SYSTEM_CONFIG_DEFAULTS, AI_CONSTANTS } from '../utils/constants.js';

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
  const temperature = config.aiTemperature ?? SYSTEM_CONFIG_DEFAULTS.AI_TEMPERATURE;
  const maxCompletionTokens = config.aiMaxTokens ?? SYSTEM_CONFIG_DEFAULTS.AI_MAX_TOKENS;

  // Retrieve available active slots not on Redis cooldown
  const availableSlots = await getAvailableSlots();

  if (availableSlots.length === 0) {
    console.error('[AI] No active API key slots available (all slots in cooldown or inactive).');
    throw new Error('All AI service slots are currently cooling down. Please retry in a few seconds.');
  }

  console.log(`[AI] Dispatching request across ${availableSlots.length} available key slot(s)...`);

  let lastError = null;

  // Cascade across slots: If Slot 1 hits rate limit (429), set Redis cooldown and instantly failover to Slot 2
  for (let i = 0; i < availableSlots.length; i++) {
    const slot = availableSlots[i];
    const client = new Groq({
      apiKey: slot.decryptedKey,
      baseURL: slot.baseUrl || 'https://api.groq.com/openai/v1'
    });

    const modelsToTry = [slot.model || config.aiModel || SYSTEM_CONFIG_DEFAULTS.AI_MODEL];
    if (config.aiFallbackModel && config.aiFallbackModel !== modelsToTry[0]) {
      modelsToTry.push(config.aiFallbackModel);
    }

    for (const model of modelsToTry) {
      try {
        console.log(`[AI] Attempting Slot "${slot.name}" (${slot.provider}) with model: ${model}...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), AI_CONSTANTS.TIMEOUT_MS);

        const chatCompletion = await client.chat.completions.create({
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
        console.log(`[AI] Success on Slot "${slot.name}" using model ${model}!`);

        const rawContent = chatCompletion.choices[0]?.message?.content || '{}';
        // Strip markdown code fences if present
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
          model,
          slotName: slot.name
        };

      } catch (error) {
        lastError = error;
        const status = error.status || error.statusCode || error.response?.status;
        const isRateLimit = status === 429 || /rate limit|quota/i.test(error.message);

        if (isRateLimit) {
          // Extract retry-after header from provider if available, default to 60s
          const retryHeader =
            error.headers?.get?.('retry-after') ||
            error.headers?.['retry-after'] ||
            error.error?.retry_after;
          const cooldownSeconds = Number(retryHeader) || 60;

          // Put this slot on cooldown in Redis with strict expiration
          await markSlotCooldown(slot.slotId, cooldownSeconds);
          console.warn(
            `[AI:Failover] Slot "${slot.name}" hit rate limit (HTTP 429). Redis cooldown set for ${cooldownSeconds}s. Cascading to next available slot...`
          );
          // Break inner model loop to immediately cascade to next API key slot
          break;
        } else {
          console.warn(`[AI] Slot "${slot.name}" error with model ${model}:`, error.message);
        }
      }
    }
  }

  console.error('[AI] All available slots exhausted. Last error:', lastError?.message);
  throw new Error(lastError?.message || 'Failed to generate flashcard across all configured AI slots');
};
