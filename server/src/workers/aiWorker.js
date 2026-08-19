import { Queue, Worker } from 'bullmq';
import redisConnection from '../config/redis.js';
import { generateRecallQuestion } from '../services/aiService.js';
import RecallItem from '../models/recallItem.js';
import { QUEUE_NAMES } from '../utils/constants.js';

// Export the Queue so the controller can add jobs to it
export const aiQueue = new Queue(QUEUE_NAMES.AI_FLASHCARD_GENERATION, {
  connection: redisConnection
});

// Create the Worker to process the jobs in the background
export const aiWorker = new Worker(QUEUE_NAMES.AI_FLASHCARD_GENERATION, async (job) => {
  const { userId, selectedText, sourceUrl } = job.data;

  console.log(`[BullMQ] Processing job ${job.id} for user ${userId}`);
  console.log(`[BullMQ] Text: "${selectedText.substring(0, 40)}..."`);

  // 1. Call AI
  const question = await generateRecallQuestion(selectedText);

  // 2. Save to DB
  await RecallItem.create({
    userId,
    selectedText,
    question,
    sourceUrl
  });

  console.log(`[BullMQ] Successfully completed job ${job.id}`);
  return { success: true };
}, {
  connection: redisConnection,
  concurrency: 5 // Process up to 5 AI requests in parallel to prevent memory leaks
});

aiWorker.on('failed', (job, err) => {
  console.error(`[BullMQ] Job ${job?.id} failed after retries:`, err.message);
});
