import RecallItem from '../models/recallItem.js';
import Deck from '../models/deck.js';
import SystemConfig from '../models/systemConfig.js';
import { aiQueue } from '../workers/aiWorker.js';
import { calculateNextReview, calculateIntervalsForCard } from '../services/spacedRepetitionService.js';
import { recordUserStudyActivity, getLocalDateString } from '../utils/streakHelper.js';
import { STATUS_CODES } from '../utils/statusCodes.js';
import { JOB_NAMES, MESSAGES, DECKS } from '../utils/constants.js';

// Clean and normalize URLs for grouping
const normalizeUrl = (url) => {
  if (!url) return '';
  return String(url).trim().split('#')[0].split('?')[0].replace(/\/+$/, '').toLowerCase();
};

// Formats a card document into a clean DTO with precomputed intervals
const formatCardResponse = (card) => {
  if (!card) return null;
  const intervals = calculateIntervalsForCard(
    card.interval,
    card.correctCount,
    card.easinessFactor,
    card.learningStep,
    card.isGraduated
  );

  return {
    _id: card._id,
    question: card.question,
    selectedText: card.selectedText,
    deck: card.deck || 'General',
    sourceUrl: card.sourceUrl || '',
    reviewCount: card.reviewCount || 0,
    nextReviewAt: card.nextReviewAt,
    lastReviewedAt: card.lastReviewedAt,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    intervals: {
      forgot: intervals.forgot.text,
      hard: intervals.hard.text,
      good: intervals.good.text,
      easy: intervals.easy.text
    }
  };
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

  // Update user study streak with client timezone awareness & Rest Day Protection
  const clientTimezone = req.headers['x-timezone'] || req.body.timezone || req.query.timezone || 'UTC';
  const todayStr = getLocalDateString(new Date(), clientTimezone);

  // Check if any existing cards were overdue before today
  const activeItems = await RecallItem.find({
    userId,
    status: 'active'
  }).select('nextReviewAt');

  const hasPastDueOthers = activeItems.some(
    (c) => c.nextReviewAt && getLocalDateString(new Date(c.nextReviewAt), clientTimezone) < todayStr
  );
  const isRestDayContinuance = !hasPastDueOthers && (req.user.currentStreak || 0) > 0;
  await recordUserStudyActivity(req.user, clientTimezone, { isRestDayContinuance });

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

// Fetch cards due for review (nextReviewAt <= now) with sliding-window batching support
export const getDueItems = async (req, res) => {
  const { limit, excludeIds, deck } = req.query;

  const now = new Date();
  const baseQuery = {
    userId: req.user._id,
    status: 'active',
    $or: [
      { nextReviewAt: { $lte: now } },
      { nextReviewAt: { $exists: false } },
      { nextReviewAt: null }
    ]
  };

  if (deck && deck !== 'All') {
    baseQuery.deck = new RegExp(`^${deck.trim()}$`, 'i');
  }

  // Count total due items matching the base query (without exclusions)
  const totalDue = await RecallItem.countDocuments(baseQuery);

  const fetchQuery = { ...baseQuery };
  if (excludeIds) {
    const idsToExclude = String(excludeIds)
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length === 24);

    if (idsToExclude.length > 0) {
      fetchQuery._id = { $nin: idsToExclude };
    }
  }

  let queryBuilder = RecallItem.find(fetchQuery)
    .sort({ isGraduated: 1, nextReviewAt: 1 });

  if (limit) {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      queryBuilder = queryBuilder.limit(parsedLimit);
    }
  }

  const dueItems = await queryBuilder.lean();

  res.set('Cache-Control', 'no-cache');
  res.status(STATUS_CODES.OK).json({
    cards: dueItems.map(formatCardResponse),
    totalDue
  });
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

  await item.save();

  // Sustain user study streak upon card review with client timezone awareness & Rest Day Protection
  const clientTimezone = req.headers['x-timezone'] || req.body.timezone || req.query.timezone || 'UTC';
  const todayStr = getLocalDateString(new Date(), clientTimezone);

  // Update user's studyStats for analytics (no per-card history stored)
  if (req.user) {
    if (!req.user.studyStats) {
      req.user.studyStats = {
        totalReviews: 0,
        correctReviews: 0,
        dailyActivity: {},
        timeOfDay: {
          Morning: { total: 0, correct: 0 },
          Afternoon: { total: 0, correct: 0 },
          Evening: { total: 0, correct: 0 },
          Night: { total: 0, correct: 0 }
        }
      };
    }

    req.user.studyStats.totalReviews = (req.user.studyStats.totalReviews || 0) + 1;
    const isCorrect = (rating === 'good' || rating === 'easy');
    if (isCorrect) {
      req.user.studyStats.correctReviews = (req.user.studyStats.correctReviews || 0) + 1;
    }

    if (!req.user.studyStats.dailyActivity) req.user.studyStats.dailyActivity = {};
    req.user.studyStats.dailyActivity[todayStr] = (req.user.studyStats.dailyActivity[todayStr] || 0) + 1;

    let localHour = new Date().getUTCHours();
    try {
      const hourFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: clientTimezone
      });
      const parsed = parseInt(hourFormatter.format(new Date()), 10);
      if (!isNaN(parsed)) localHour = parsed % 24;
    } catch {
      localHour = new Date().getUTCHours();
    }

    let timeBucket = 'Night';
    if (localHour >= 5 && localHour < 12) timeBucket = 'Morning';
    else if (localHour >= 12 && localHour < 17) timeBucket = 'Afternoon';
    else if (localHour >= 17 && localHour < 21) timeBucket = 'Evening';

    if (!req.user.studyStats.timeOfDay) {
      req.user.studyStats.timeOfDay = {
        Morning: { total: 0, correct: 0 },
        Afternoon: { total: 0, correct: 0 },
        Evening: { total: 0, correct: 0 },
        Night: { total: 0, correct: 0 }
      };
    }
    const bucket = req.user.studyStats.timeOfDay[timeBucket] || { total: 0, correct: 0 };
    bucket.total = (bucket.total || 0) + 1;
    if (isCorrect) bucket.correct = (bucket.correct || 0) + 1;
    req.user.studyStats.timeOfDay[timeBucket] = bucket;

    req.user.markModified('studyStats');
  }

  const otherActiveItems = await RecallItem.find({
    userId: req.user._id,
    status: 'active',
    _id: { $ne: item._id }
  }).select('nextReviewAt');

  const hasPastDueOthers = otherActiveItems.some(
    (c) => c.nextReviewAt && getLocalDateString(new Date(c.nextReviewAt), clientTimezone) < todayStr
  );
  const isRestDayContinuance = !hasPastDueOthers && (req.user.currentStreak || 0) > 0;
  await recordUserStudyActivity(req.user, clientTimezone, { isRestDayContinuance });

  res.status(STATUS_CODES.OK).json(formatCardResponse(item));
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

// Fetch all active items with optional URL filter (and optional decks bundling)
export const getAllItems = async (req, res) => {
  const query = { userId: req.user._id, status: 'active' };
  if (req.query.url) {
    const cleanUrl = normalizeUrl(req.query.url);
    if (cleanUrl) query.sourceUrl = cleanUrl;
  }

  const includeDecks = req.query.includeDecks === 'true';

  if (includeDecks) {
    let [items, decks] = await Promise.all([
      RecallItem.find(query).sort({ createdAt: -1 }).lean(),
      Deck.find({ userId: req.user._id }).sort({ createdAt: 1 }).lean()
    ]);

    if (decks.length === 0) {
      const defaultDeck = await Deck.create({
        userId: req.user._id,
        name: DECKS?.DEFAULT_NAME || 'General',
        color: DECKS?.DEFAULT_COLOR || '#FF9532'
      });
      decks = [defaultDeck];
    }

    res.set('Cache-Control', 'no-cache');
    return res.status(STATUS_CODES.OK).json({ cards: items.map(formatCardResponse), decks });
  }

  const items = await RecallItem.find(query).sort({ createdAt: -1 }).lean();
  res.set('Cache-Control', 'no-cache');
  res.status(STATUS_CODES.OK).json(items.map(formatCardResponse));
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
  res.status(STATUS_CODES.OK).json(formatCardResponse(item));
};
