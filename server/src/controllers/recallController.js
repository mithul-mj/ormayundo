import RecallItem from '../models/recallItem.js';
import { aiQueue } from '../workers/aiWorker.js';
import { calculateNextReview } from '../services/spacedRepetitionService.js';
import { STATUS_CODES } from '../utils/statusCodes.js';
import { JOB_NAMES } from '../utils/constants.js';

// @desc    Create a new recall item from selected text
// @route   POST /api/recall
// @access  Private
export const createRecallItem = async (req, res) => {
  console.log('--- NEW SAVE REQUEST ---');
  
  if (!req.user) {
    console.error('[Backend] Save request failed: No User attached (Cookie missing?)');
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }

  const { selectedText, sourceUrl } = req.body;
  const userId = req.user._id;

  console.log(`[Backend] Received text to save: "${selectedText?.substring(0, 30)}..." for user ${userId}`);

  // 1. Add the job to the BullMQ Queue safely
  try {
    const job = await aiQueue.add(JOB_NAMES.GENERATE_FLASHCARD, {
      userId,
      selectedText,
      sourceUrl
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
    
    console.log(`[Backend] Job successfully added to Queue with ID: ${job.id}`);

    // 2. Instantly respond to the user
    res.status(STATUS_CODES.CREATED).json({ message: 'Flashcard added to the AI Queue!' });
  } catch (error) {
    console.error(`[BullMQ Error] CRITICAL FAILED TO ADD JOB:`, error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to add job to queue. Check backend logs!',
      error: error.message
    });
  }
};

// @desc    Get all recall items due for review
// @route   GET /api/recall/due
// @access  Private
export const getDueItems = async (req, res) => {
  const dueItems = await RecallItem.find({
    userId: req.user._id,
    status: 'active',
    nextReviewAt: { $lte: new Date() } // $lte means "Less Than or Equal to" today
  }).sort({ nextReviewAt: 1 }); // Sort oldest first

  res.status(STATUS_CODES.OK).json(dueItems);
};

// @desc    Review a recall item and schedule next review
// @route   POST /api/recall/:id/review
// @access  Private
export const reviewRecallItem = async (req, res) => {
  const { rating } = req.body; // 'forgot', 'hard', 'good', 'easy'
  const recallId = req.params.id;

  // 1. Find the flashcard
  const item = await RecallItem.findOne({ _id: recallId, userId: req.user._id });

  if (!item) {
    res.status(STATUS_CODES.NOT_FOUND);
    throw new Error('Recall item not found');
  }

  // 2. Calculate the next review date using our engine
  const { nextReviewAt, newCorrectCount, intervalDays } = calculateNextReview(
    item.correctCount || 0,
    rating
  );

  // 3. Update the item
  item.correctCount = newCorrectCount;
  item.nextReviewAt = nextReviewAt;
  item.lastReviewedAt = new Date();

  // Ensure properties exist before mutating
  if (!item.reviewCount) item.reviewCount = 0;
  item.reviewCount += 1;

  if (!item.reviewHistory) item.reviewHistory = [];
  item.reviewHistory.push({
    reviewedAt: new Date(),
    rating,
    newInterval: intervalDays
  });

  await item.save();

  res.status(STATUS_CODES.OK).json(item);
};
