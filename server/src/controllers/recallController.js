import RecallItem from '../models/recallItem.js';
import SystemConfig from '../models/systemConfig.js';
import { aiQueue } from '../workers/aiWorker.js';
import { calculateNextReview } from '../services/spacedRepetitionService.js';
import { STATUS_CODES } from '../utils/statusCodes.js';
import { JOB_NAMES, MESSAGES } from '../utils/constants.js';

// Clean and normalize URLs for grouping
const normalizeUrl = (url) => {
  if (!url) return '';
  return String(url).trim().split('#')[0].split('?')[0].replace(/\/+$/, '').toLowerCase();
};

// Queue a new recall item from selected text
export const createRecallItem = async (req, res) => {
  if (!req.user) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.UNAUTHORIZED });
  }

  const { selectedText, sourceUrl } = req.body;
  const userId = req.user._id;
  const cleanSourceUrl = normalizeUrl(sourceUrl);

  // --- Dynamic Guardrails ---
  const config = await SystemConfig.getSettings();

  // Guardrail 1: Maintenance Mode Kill Switch
  if (config.maintenanceMode && req.user.role !== 'admin') {
    return res.status(503).json({
      message: config.maintenanceMessage || 'Ormayundo is temporarily undergoing maintenance.'
    });
  }

  // Guardrail 2: AI Generation Emergency Pause
  if (!config.aiEnabled && req.user.role !== 'admin') {
    return res.status(503).json({
      message: 'AI flashcard generation is temporarily paused by platform administrator.'
    });
  }

  // Guardrail 3: Maximum Input Text Length
  const maxChars = config.maxTextLength || 4000;
  if (selectedText && selectedText.length > maxChars) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: `Selected text exceeds maximum allowed length of ${maxChars} characters.`
    });
  }

  // Guardrail 4: Per-User Daily Creation Quota
  if (req.user.role !== 'admin') {
    const dailyLimit = req.user.customDailyLimit ?? config.dailyCardLimit ?? 30;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const cardsCreatedToday = await RecallItem.countDocuments({
      userId,
      createdAt: { $gte: startOfToday }
    });

    if (cardsCreatedToday >= dailyLimit) {
      return res.status(429).json({
        message: `Daily card limit reached (${dailyLimit}/day). Your limit resets at midnight.`
      });
    }
  }

  // Update user study streak
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const lastAddedStr = req.user.lastAddedDate ? new Date(req.user.lastAddedDate).toISOString().split('T')[0] : null;

  if (lastAddedStr !== todayStr) {
    req.user.currentStreak = lastAddedStr === yesterdayStr ? (req.user.currentStreak || 0) + 1 : 1;
    if (req.user.currentStreak > (req.user.maxStreak || 0)) {
      req.user.maxStreak = req.user.currentStreak;
    }
    req.user.lastAddedDate = now;
    await req.user.save();
  }

  // Push task to BullMQ Queue
  try {
    await aiQueue.add(JOB_NAMES.GENERATE_FLASHCARD, {
      userId,
      selectedText,
      sourceUrl: cleanSourceUrl
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });

    res.status(STATUS_CODES.CREATED).json({ message: MESSAGES.SUCCESS.FLASHCARD_QUEUED });
  } catch (error) {
    console.error(`[BullMQ Error] Failed to add job:`, error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: MESSAGES.ERROR.QUEUE_JOB_FAILED,
      error: error.message
    });
  }
};

// Fetch cards due for review (nextReviewAt <= now)
export const getDueItems = async (req, res) => {
  const dueItems = await RecallItem.find({
    userId: req.user._id,
    status: 'active',
    nextReviewAt: { $lte: new Date() }
  }).sort({ isGraduated: 1, nextReviewAt: 1 });

  res.status(STATUS_CODES.OK).json(dueItems);
};

// Rate a flashcard and reschedule via SM-2
export const reviewRecallItem = async (req, res) => {
  const { rating } = req.body;
  const recallId = req.params.id;

  const item = await RecallItem.findOne({ _id: recallId, userId: req.user._id });
  if (!item) {
    res.status(STATUS_CODES.NOT_FOUND);
    throw new Error(MESSAGES.ERROR.RECALL_NOT_FOUND);
  }

  const {
    nextReviewAt,
    newInterval,
    newRepetitions,
    newEasinessFactor,
    newLearningStep,
    newIsGraduated
  } = calculateNextReview(
    item.interval || 0,
    item.correctCount || 0,
    item.easinessFactor || 2.5,
    rating,
    item.learningStep || 0,
    item.isGraduated || false
  );

  item.interval = newInterval;
  item.correctCount = newRepetitions;
  item.easinessFactor = newEasinessFactor;
  item.learningStep = newLearningStep;
  item.isGraduated = newIsGraduated;
  item.nextReviewAt = nextReviewAt;
  item.lastReviewedAt = new Date();
  item.notificationSent = false;

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

// Soft delete a single recall item
export const deleteRecallItem = async (req, res) => {
  const item = await RecallItem.findOne({ _id: req.params.id, userId: req.user._id });
  if (!item) {
    res.status(STATUS_CODES.NOT_FOUND);
    throw new Error(MESSAGES.ERROR.RECALL_NOT_FOUND);
  }

  item.status = 'archived';
  await item.save();
  res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.RECALL_DELETED });
};

// Wipe all recall items for user
export const deleteAllRecallItems = async (req, res) => {
  await RecallItem.updateMany(
    { userId: req.user._id, status: 'active' },
    { $set: { status: 'archived' } }
  );
  res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.ALL_RECALL_WIPED });
};

// Fetch all active items with optional URL filter
export const getAllItems = async (req, res) => {
  const query = { userId: req.user._id, status: 'active' };
  if (req.query.url) {
    const cleanUrl = normalizeUrl(req.query.url);
    if (cleanUrl) query.sourceUrl = cleanUrl;
  }
  const items = await RecallItem.find(query).sort({ createdAt: -1 });
  res.status(STATUS_CODES.OK).json(items);
};

// Update question, text, or deck of a card
export const editRecallItem = async (req, res) => {
  const { question, selectedText, deck } = req.body;
  const item = await RecallItem.findOne({ _id: req.params.id, userId: req.user._id });

  if (!item) {
    res.status(STATUS_CODES.NOT_FOUND);
    throw new Error(MESSAGES.ERROR.RECALL_NOT_FOUND);
  }

  if (question) item.question = question;
  if (selectedText) item.selectedText = selectedText;
  if (deck) item.deck = deck;

  await item.save();
  res.status(STATUS_CODES.OK).json(item);
};
