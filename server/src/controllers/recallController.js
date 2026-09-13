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
  const cleanSourceUrl = normalizeUrl(sourceUrl);

  console.log(`[Backend] Received text to save: "${selectedText?.substring(0, 30)}..." for user ${userId} (URL: ${cleanSourceUrl})`);

  // Optimize: Update Streak in Database
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const lastAddedStr = req.user.lastAddedDate ? new Date(req.user.lastAddedDate).toISOString().split('T')[0] : null;

  if (lastAddedStr !== todayStr) {
    if (lastAddedStr === yesterdayStr) {
      req.user.currentStreak = (req.user.currentStreak || 0) + 1;
    } else {
      req.user.currentStreak = 1;
    }

    if (req.user.currentStreak > (req.user.maxStreak || 0)) {
      req.user.maxStreak = req.user.currentStreak;
    }

    req.user.lastAddedDate = now;
    await req.user.save();
  }

  // 1. Add the job to the BullMQ Queue safely
  try {
    const job = await aiQueue.add(JOB_NAMES.GENERATE_FLASHCARD, {
      userId,
      selectedText,
      sourceUrl: cleanSourceUrl
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

  // 2. Calculate the next review date using SM-2 engine
  const { nextReviewAt, newInterval, newRepetitions, newEasinessFactor } = calculateNextReview(
    item.interval || 0,
    item.correctCount || 0,
    item.easinessFactor || 2.5,
    rating
  );

  // 3. Update the item
  item.interval = newInterval;
  item.correctCount = newRepetitions;
  item.easinessFactor = newEasinessFactor;
  item.nextReviewAt = nextReviewAt;
  item.lastReviewedAt = new Date();
  item.notificationSent = false; // CRITICAL: Reset the memory flag for the next cycle!

  // Ensure properties exist before mutating
  if (!item.reviewCount) item.reviewCount = 0;
  item.reviewCount += 1;

  if (!item.reviewHistory) item.reviewHistory = [];
  item.reviewHistory.push({
    reviewedAt: new Date(),
    rating,
    newInterval
  });

  await item.save();

  res.status(STATUS_CODES.OK).json(item);
};

// @desc    Delete a recall item
// @route   DELETE /api/recall/:id
// @access  Private
export const deleteRecallItem = async (req, res) => {
  const recallId = req.params.id;

  const item = await RecallItem.findOne({ _id: recallId, userId: req.user._id });

  if (!item) {
    res.status(STATUS_CODES.NOT_FOUND);
    throw new Error('Recall item not found');
  }

  // Soft delete instead of physical delete to preserve analytics data
  item.status = 'archived';
  await item.save();

  res.status(STATUS_CODES.OK).json({ message: 'Recall item deleted successfully' });
};

// @desc    Delete all recall items for a user
// @route   DELETE /api/recall/all
// @access  Private
export const deleteAllRecallItems = async (req, res) => {
  // Soft delete all active items
  await RecallItem.updateMany(
    { userId: req.user._id, status: 'active' },
    { $set: { status: 'archived' } }
  );
  res.status(STATUS_CODES.OK).json({ message: 'All recall items wiped successfully' });
};

const normalizeUrl = (url) => {
  if (!url) return '';
  return String(url).trim().split('#')[0].split('?')[0].replace(/\/+$/, '').toLowerCase();
};

// @desc    Get all recall items (for Manager view), optionally filtered by sourceUrl
// @route   GET /api/recall
// @route   GET /api/recall?url=https://...
// @access  Private
export const getAllItems = async (req, res) => {
  const query = { userId: req.user._id, status: 'active' };
  if (req.query.url) {
    const cleanUrl = normalizeUrl(req.query.url);
    if (cleanUrl) {
      query.sourceUrl = cleanUrl;
    }
  }
  const items = await RecallItem.find(query).sort({ createdAt: -1 });
  res.status(STATUS_CODES.OK).json(items);
};

// @desc    Edit a recall item (Question/Answer/Deck)
// @route   PUT /api/recall/:id
// @access  Private
export const editRecallItem = async (req, res) => {
  const { question, selectedText, deck } = req.body;
  const recallId = req.params.id;

  const item = await RecallItem.findOne({ _id: recallId, userId: req.user._id });

  if (!item) {
    res.status(STATUS_CODES.NOT_FOUND);
    throw new Error('Recall item not found');
  }

  if (question) item.question = question;
  if (selectedText) item.selectedText = selectedText;
  if (deck) item.deck = deck;

  await item.save();

  res.status(STATUS_CODES.OK).json(item);
};
