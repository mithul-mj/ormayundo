import SystemConfig from '../models/systemConfig.js';
import { getRedisClient } from '../config/redis.js';
import { encrypt, decrypt, maskApiKey } from '../utils/crypto.js';

const COOLDOWN_KEY_PREFIX = 'ai_key:cooldown:';
const DEFAULT_COOLDOWN_SECONDS = 60;

/**
 * Normalizes configured slots or falls back to process.env.AI_API_KEY
 */
export async function getConfiguredSlots() {
  const config = await SystemConfig.getSettings();
  let slots = config.apiSlots || [];

  // If no slots exist in database, initialize a default slot from .env
  if (slots.length === 0) {
    const envKey = process.env.AI_API_KEY || '';
    const defaultSlot = {
      slotId: 'slot_default_primary',
      name: 'Primary Groq Key (Environment)',
      provider: 'groq',
      apiKey: envKey ? encrypt(envKey) : '',
      baseUrl: 'https://api.groq.com/openai/v1',
      model: config.aiModel || 'llama-3.3-70b-versatile',
      isActive: true,
      createdAt: new Date()
    };
    slots = [defaultSlot];
  }

  return slots;
}

/**
 * Checks Redis cooldown TTL for a slot.
 * Returns { isCoolingDown: boolean, remainingSeconds: number }
 */
export async function checkSlotCooldown(slotId) {
  try {
    const redis = getRedisClient();
    const ttl = await redis.ttl(`${COOLDOWN_KEY_PREFIX}${slotId}`);
    if (ttl > 0) {
      return { isCoolingDown: true, remainingSeconds: ttl };
    }
  } catch (err) {
    console.warn(`[KeyManager] Redis cooldown check error for ${slotId}:`, err.message);
  }
  return { isCoolingDown: false, remainingSeconds: 0 };
}

/**
 * Marks a slot as cooling down in Redis with an expiration (TTL).
 * This ensures Redis automatically clears the cooldown once the window passes.
 */
export async function markSlotCooldown(slotId, cooldownSeconds = DEFAULT_COOLDOWN_SECONDS) {
  try {
    const redis = getRedisClient();
    const seconds = Math.max(5, Number(cooldownSeconds) || DEFAULT_COOLDOWN_SECONDS);
    // Use Redis 'EX' to set strict time-to-live expiration
    await redis.set(`${COOLDOWN_KEY_PREFIX}${slotId}`, 'rate_limited', 'EX', seconds);
    console.log(`[KeyManager] Slot "${slotId}" put on cooldown for ${seconds}s (Redis TTL set)`);
    return seconds;
  } catch (err) {
    console.error(`[KeyManager] Failed to set Redis cooldown for ${slotId}:`, err.message);
    return DEFAULT_COOLDOWN_SECONDS;
  }
}

/**
 * Clears Redis cooldown manually for a slot.
 */
export async function clearSlotCooldown(slotId) {
  try {
    const redis = getRedisClient();
    await redis.del(`${COOLDOWN_KEY_PREFIX}${slotId}`);
    console.log(`[KeyManager] Cooldown cleared for slot "${slotId}"`);
  } catch (err) {
    console.error(`[KeyManager] Failed to clear cooldown for ${slotId}:`, err.message);
  }
}

/**
 * Returns available healthy slots for AI generation, sorted by priority (active & not in cooldown).
 * Decrypts API keys ready for inference.
 */
export async function getAvailableSlots() {
  const allSlots = await getConfiguredSlots();
  const activeSlots = allSlots.filter((s) => s.isActive);

  const available = [];
  for (const slot of activeSlots) {
    const { isCoolingDown, remainingSeconds } = await checkSlotCooldown(slot.slotId);
    if (!isCoolingDown) {
      const rawKey = decrypt(slot.apiKey);
      if (rawKey) {
        available.push({
          ...slot,
          decryptedKey: rawKey,
          isCoolingDown: false,
          remainingSeconds: 0
        });
      }
    } else {
      console.log(`[KeyManager] Slot "${slot.name}" is currently on cooldown (${remainingSeconds}s remaining). Skipping...`);
    }
  }

  return available;
}

/**
 * Returns safe slot information for the Admin UI (with masked keys and live cooldown status).
 */
export async function getAdminSlotsSummary() {
  const slots = await getConfiguredSlots();

  const enriched = await Promise.all(
    slots.map(async (slot) => {
      const rawKey = decrypt(slot.apiKey);
      const { isCoolingDown, remainingSeconds } = await checkSlotCooldown(slot.slotId);

      return {
        slotId: slot.slotId,
        name: slot.name,
        provider: slot.provider,
        model: slot.model,
        baseUrl: slot.baseUrl,
        maskedKey: maskApiKey(rawKey),
        hasKey: Boolean(rawKey),
        isActive: slot.isActive,
        isCoolingDown,
        remainingSeconds,
        createdAt: slot.createdAt
      };
    })
  );

  return enriched;
}

