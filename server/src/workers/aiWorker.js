import { Queue, Worker } from 'bullmq';
import { getBullMQConnectionOptions } from '../config/redis.js';
import { generateRecallQuestion } from '../services/aiService.js';
import RecallItem from '../models/recallItem.js';
import Deck from '../models/deck.js';
import { QUEUE_NAMES } from '../utils/constants.js';

const connectionOptions = getBullMQConnectionOptions();

// Export the Queue so the controller can add jobs to it
export const aiQueue = new Queue(QUEUE_NAMES.AI_FLASHCARD_GENERATION, {
  connection: connectionOptions
});

// Create the Worker to process the jobs in the background
export const aiWorker = new Worker(QUEUE_NAMES.AI_FLASHCARD_GENERATION, async (job) => {
  const { userId, selectedText, sourceUrl } = job.data;

  console.log(`[BullMQ] Processing job ${job.id} for user ${userId}`);
  console.log(`[BullMQ] Text: "${selectedText.substring(0, 40)}..."`);

  // 1. Fetch user's existing deck names
  let userDeckNames = ['General'];
  try {
    const userDecks = await Deck.find({ userId });
    if (userDecks && userDecks.length > 0) {
      userDeckNames = userDecks.map(d => d.name);
    }
  } catch (e) {
    console.error('[BullMQ] Could not fetch user decks, using fallback:', e);
  }

  // 2. Call AI Generation & Classification
  console.log(`[BullMQ] Starting AI Generation with decks [${userDeckNames.join(', ')}]...`);
  try {
    const { question, deck } = await generateRecallQuestion(selectedText, userDeckNames, sourceUrl);
    console.log(`[BullMQ] AI Generation successful! Question: "${question}", Assigned Deck: "${deck}"`);

    // 3. Save to DB
    console.log(`[BullMQ] Saving to MongoDB...`);
    const newItem = await RecallItem.create({
      userId,
      selectedText,
      question,
      sourceUrl,
      deck: deck || 'General'
    });
    console.log(`[BullMQ] Successfully created MongoDB document with ID: ${newItem._id} in deck "${newItem.deck}"`);

    return { success: true, id: newItem._id };
  } catch (error) {
    console.error(`[BullMQ] Fatal Error during job processing:`, error);
    throw error;
  }
}, {
  connection: connectionOptions,
  concurrency: 5, // Process up to 5 AI requests in parallel
  limiter: {
    max: 25, // Maximum 25 jobs
    duration: 60000 // Per 60,000ms (1 minute) to stay comfortably within Groq API rate limits
  }
});

aiWorker.on('failed', (job, err) => {
  console.error(`[BullMQ] Job ${job?.id} failed after retries:`, err.message);
});

/**
 * Industry-standard graceful shutdown for BullMQ.
 * Waits for any actively processing job to complete before closing connections.
 */
export const closeAiWorker = async () => {
  console.log('[BullMQ] Shutting down worker and queue...');
  await Promise.allSettled([
    aiWorker.close(),
    aiQueue.close()
  ]);
  console.log('[BullMQ] Worker and queue closed cleanly.');
};
