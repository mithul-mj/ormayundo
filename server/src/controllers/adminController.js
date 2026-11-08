import User from '../models/user.js';
import RecallItem from '../models/recallItem.js';
import Deck from '../models/deck.js';
import TokenUsage from '../models/tokenUsage.js';
import SystemConfig from '../models/systemConfig.js';
import SystemIncident from '../models/systemIncident.js';
import { aiQueue } from '../workers/aiWorker.js';
import { sendPushNotification } from '../services/pushService.js';
import { STATUS_CODES } from '../utils/statusCodes.js';
import { PAGINATION, SYSTEM_METRICS } from '../utils/constants.js';

// 1. High-level Overview Dashboard Statistics
export const getAdminStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      blockedUsers,
      totalCards,
      graduatedCards,
      archivedCards,
      totalDecks,
      topDecksAgg,
      tokenAgg,
      activeTodayCount,
      jobCounts,
      unresolvedIncidentsCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBlocked: true }),
      RecallItem.countDocuments({ status: 'active' }),
      RecallItem.countDocuments({ status: 'active', isGraduated: true }),
      RecallItem.countDocuments({ status: 'archived' }),
      Deck.countDocuments(),
      RecallItem.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: { $ifNull: ['$deck', 'General'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]),
      TokenUsage.aggregate([
        {
          $group: {
            _id: null,
            totalTokens: { $sum: '$totalTokens' },
            promptTokens: { $sum: '$promptTokens' },
            completionTokens: { $sum: '$completionTokens' },
            estimatedCost: { $sum: '$estimatedCost' },
            count: { $sum: 1 }
          }
        }
      ]),
      User.countDocuments({ lastAddedDate: { $gte: today } }),
      aiQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed').catch(() => ({
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0
      })),
      SystemIncident.countDocuments({ status: 'unresolved' })
    ]);

    const tokenStats = tokenAgg[0] || {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      estimatedCost: 0,
      count: 0
    };

    res.status(STATUS_CODES.OK).json({
      users: {
        total: totalUsers,
        blocked: blockedUsers,
        activeToday: activeTodayCount
      },
      flashcards: {
        total: totalCards,
        graduated: graduatedCards,
        archived: archivedCards,
        learning: Math.max(0, totalCards - graduatedCards),
        totalDecks,
        topDecks: topDecksAgg.map((d) => ({
          name: d._id,
          count: d.count
        }))
      },
      tokens: {
        totalTokens: tokenStats.totalTokens,
        promptTokens: tokenStats.promptTokens,
        completionTokens: tokenStats.completionTokens,
        estimatedCost: Number(tokenStats.estimatedCost.toFixed(SYSTEM_METRICS.COST_DECIMALS)),
        totalGenerations: tokenStats.count
      },
      queue: jobCounts,
      incidents: {
        unresolved: unresolvedIncidentsCount
      }
    });
  } catch (error) {
    console.error('[Admin] getAdminStats error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 2. Paginated User Directory with Search & Stats
export const getAdminUsers = async (req, res) => {
  try {
    const page = Math.max(PAGINATION.DEFAULT_PAGE, parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(PAGINATION.DEFAULT_PAGE, parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const status = req.query.status; // 'all', 'active', 'blocked'
    const role = req.query.role; // 'all', 'user', 'admin'

    const filter = {};
    if (search) {
      filter.email = { $regex: search, $options: 'i' };
    }
    if (status === 'blocked') filter.isBlocked = true;
    if (status === 'active') filter.isBlocked = { $ne: true };
    if (role && role !== 'all') filter.role = role;

    const [totalUsers, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    // Aggregate statistics per user in parallel
    const userIds = users.map((u) => u._id);

    const [cardCounts, tokenCounts, deckCounts] = await Promise.all([
      RecallItem.aggregate([
        { $match: { userId: { $in: userIds }, status: 'active' } },
        { $group: { _id: '$userId', count: { $sum: 1 } } }
      ]),
      TokenUsage.aggregate([
        { $match: { userId: { $in: userIds } } },
        {
          $group: {
            _id: '$userId',
            totalTokens: { $sum: '$totalTokens' },
            estimatedCost: { $sum: '$estimatedCost' },
            generations: { $sum: 1 }
          }
        }
      ]),
      Deck.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } }
      ])
    ]);

    const cardMap = new Map(cardCounts.map((c) => [c._id.toString(), c.count]));
    const tokenMap = new Map(tokenCounts.map((t) => [t._id.toString(), t]));
    const deckMap = new Map(deckCounts.map((d) => [d._id.toString(), d.count]));

    const enrichedUsers = users.map((u) => {
      const uId = u._id.toString();
      const tokenInfo = tokenMap.get(uId) || { totalTokens: 0, estimatedCost: 0, generations: 0 };
      const fcmCount = Array.isArray(u.fcmTokens) ? u.fcmTokens.length : u.fcmToken ? 1 : 0;

      return {
        _id: u._id,
        email: u.email,
        role: u.role || 'user',
        isBlocked: !!u.isBlocked,
        blockedReason: u.blockedReason || '',
        blockedAt: u.blockedAt || null,
        currentStreak: u.currentStreak || 0,
        maxStreak: u.maxStreak || 0,
        createdAt: u.createdAt,
        lastAddedDate: u.lastAddedDate,
        cardsCount: cardMap.get(uId) || 0,
        decksCount: deckMap.get(uId) || 0,
        tokensUsed: tokenInfo.totalTokens,
        estimatedCost: Number((tokenInfo.estimatedCost || 0).toFixed(4)),
        generationsCount: tokenInfo.generations,
        fcmDevicesCount: fcmCount
      };
    });

    res.status(STATUS_CODES.OK).json({
      users: enrichedUsers,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('[Admin] getAdminUsers error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 3. Block or Unblock a User
export const toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked, reason } = req.body;

    if (req.user._id.toString() === id && isBlocked) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: 'Administrators cannot block their own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    user.isBlocked = !!isBlocked;
    if (user.isBlocked) {
      user.blockedReason = reason || 'Suspended by administrator';
      user.blockedAt = new Date();
      // Instantly invalidate active sessions across all devices
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    } else {
      user.blockedReason = '';
      user.blockedAt = null;
    }

    await user.save();

    res.status(STATUS_CODES.OK).json({
      message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
      user: {
        _id: user._id,
        email: user.email,
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason,
        tokenVersion: user.tokenVersion
      }
    });
  } catch (error) {
    console.error('[Admin] toggleBlockUser error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 4. Update User Role (promote to admin or demote to user)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Invalid role' });
    }

    if (req.user._id.toString() === id && role !== 'admin') {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: 'You cannot remove your own admin privileges'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    if (
      role === 'user' &&
      process.env.ADMIN_EMAIL &&
      user.email.toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase()
    ) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: 'Cannot demote the primary system administrator email to a regular user'
      });
    }

    user.role = role;
    await user.save();

    res.status(STATUS_CODES.OK).json({
      message: `User role updated to ${role}`,
      user: { _id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('[Admin] updateUserRole error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 5. Force Logout / Revoke All Sessions for a User
export const revokeUserSessions = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.status(STATUS_CODES.OK).json({
      message: 'All active sessions for this user have been invalidated',
      tokenVersion: user.tokenVersion
    });
  } catch (error) {
    console.error('[Admin] revokeUserSessions error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 6. Detailed AI Token Consumption Analytics
export const getTokenAnalytics = async (req, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const [totalsAgg, dailyAgg, leaderboardAgg, modelAgg, recentLogs] = await Promise.all([
      // Overall totals
      TokenUsage.aggregate([
        {
          $group: {
            _id: null,
            totalTokens: { $sum: '$totalTokens' },
            promptTokens: { $sum: '$promptTokens' },
            completionTokens: { $sum: '$completionTokens' },
            estimatedCost: { $sum: '$estimatedCost' },
            count: { $sum: 1 }
          }
        }
      ]),
      // Daily trend over last 14 days
      TokenUsage.aggregate([
        { $match: { createdAt: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            totalTokens: { $sum: '$totalTokens' },
            promptTokens: { $sum: '$promptTokens' },
            completionTokens: { $sum: '$completionTokens' },
            estimatedCost: { $sum: '$estimatedCost' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Top 10 token consumers
      TokenUsage.aggregate([
        {
          $group: {
            _id: '$userId',
            totalTokens: { $sum: '$totalTokens' },
            promptTokens: { $sum: '$promptTokens' },
            completionTokens: { $sum: '$completionTokens' },
            estimatedCost: { $sum: '$estimatedCost' },
            generations: { $sum: 1 }
          }
        },
        { $sort: { totalTokens: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
      ]),
      // Breakdown by AI Model
      TokenUsage.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$model', 'openai/gpt-oss-120b'] },
            totalTokens: { $sum: '$totalTokens' },
            promptTokens: { $sum: '$promptTokens' },
            completionTokens: { $sum: '$completionTokens' },
            estimatedCost: { $sum: '$estimatedCost' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalTokens: -1 } }
      ]),
      // Recent 20 generations
      TokenUsage.find()
        .populate('userId', 'email')
        .populate('cardId', 'question deck')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
    ]);

    const totals = totalsAgg[0] || {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      estimatedCost: 0,
      count: 0
    };

    const leaderboard = leaderboardAgg.map((item) => ({
      userId: item._id,
      email: item.user?.email || 'Unknown User',
      totalTokens: item.totalTokens,
      promptTokens: item.promptTokens,
      completionTokens: item.completionTokens,
      estimatedCost: Number(item.estimatedCost.toFixed(4)),
      generations: item.generations
    }));

    res.status(STATUS_CODES.OK).json({
      totals: {
        totalTokens: totals.totalTokens,
        promptTokens: totals.promptTokens,
        completionTokens: totals.completionTokens,
        estimatedCost: Number(totals.estimatedCost.toFixed(4)),
        totalGenerations: totals.count
      },
      daily: dailyAgg.map((d) => ({
        date: d._id,
        totalTokens: d.totalTokens,
        promptTokens: d.promptTokens,
        completionTokens: d.completionTokens,
        cost: Number(d.estimatedCost.toFixed(SYSTEM_METRICS.COST_DECIMALS)),
        count: d.count
      })),
      models: modelAgg.map((m) => ({
        model: m._id,
        totalTokens: m.totalTokens,
        promptTokens: m.promptTokens,
        completionTokens: m.completionTokens,
        cost: Number(m.estimatedCost.toFixed(SYSTEM_METRICS.COST_DECIMALS)),
        count: m.count
      })),
      leaderboard,
      recentLogs: recentLogs.map((log) => ({
        _id: log._id,
        userEmail: log.userId?.email || 'Unknown',
        question: log.cardId?.question || 'N/A',
        deck: log.cardId?.deck || 'General',
        totalTokens: log.totalTokens,
        model: log.model,
        estimatedCost: Number(log.estimatedCost.toFixed(SYSTEM_METRICS.LOG_COST_DECIMALS)),
        sourceUrl: log.sourceUrl,
        createdAt: log.createdAt
      }))
    });
  } catch (error) {
    console.error('[Admin] getTokenAnalytics error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 7. System & Infrastructure Health
export const getSystemHealth = async (req, res) => {
  try {
    const memory = process.memoryUsage();
    const jobCounts = await aiQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed').catch(() => ({}));

    const totalFcmDevices = await User.aggregate([
      {
        $project: {
          tokenCount: {
            $size: { $ifNull: ['$fcmTokens', []] }
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$tokenCount' }
        }
      }
    ]);

    res.status(STATUS_CODES.OK).json({
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMb: Math.round(memory.rss / SYSTEM_METRICS.BYTES_PER_MB),
        heapUsedMb: Math.round(memory.heapUsed / SYSTEM_METRICS.BYTES_PER_MB),
        heapTotalMb: Math.round(memory.heapTotal / SYSTEM_METRICS.BYTES_PER_MB)
      },
      queue: jobCounts,
      notifications: {
        totalRegisteredDevices: totalFcmDevices[0]?.total || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Admin] getSystemHealth error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 8. Broadcast Push Notification to Users
export const broadcastPush = async (req, res) => {
  const { title, body, userIds } = req.body;

  if (!title || !body) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Title and body are required' });
  }

  try {
    const query = {};
    if (Array.isArray(userIds) && userIds.length > 0) {
      query._id = { $in: userIds };
    }
    query.isBlocked = { $ne: true };

    const users = await User.find(query).select('fcmToken fcmTokens').lean();

    const allTokens = new Set();
    users.forEach((u) => {
      if (u.fcmToken) allTokens.add(u.fcmToken);
      if (Array.isArray(u.fcmTokens)) {
        u.fcmTokens.forEach((t) => {
          if (t) allTokens.add(t);
        });
      }
    });

    const tokenArray = Array.from(allTokens);
    if (tokenArray.length === 0) {
      return res.status(STATUS_CODES.OK).json({
        message: 'No registered push devices found',
        dispatched: 0
      });
    }

    // Send notifications in batches
    let dispatched = 0;
    const batchSize = SYSTEM_METRICS.PUSH_BATCH_SIZE;
    for (let i = 0; i < tokenArray.length; i += batchSize) {
      const batch = tokenArray.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map((token) => sendPushNotification(token, title, body))
      );
      dispatched += batch.length;
    }

    res.status(STATUS_CODES.OK).json({
      message: `Notification broadcast sent to ${dispatched} devices`,
      dispatched
    });
  } catch (error) {
    console.error('[Admin] broadcastPush error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 9. Retry Failed BullMQ Jobs
export const retryFailedJobs = async (req, res) => {
  try {
    const failedJobs = await aiQueue.getFailed();
    let retried = 0;

    for (const job of failedJobs) {
      await job.retry();
      retried++;
    }

    res.status(STATUS_CODES.OK).json({
      message: `Successfully retried ${retried} failed jobs`,
      retried
    });
  } catch (error) {
    console.error('[Admin] retryFailedJobs error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 10. Get Dynamic Platform Guardrails & System Config
export const getSystemConfig = async (req, res) => {
  try {
    const config = await SystemConfig.getSettings();
    res.status(STATUS_CODES.OK).json(config);
  } catch (error) {
    console.error('[Admin] getSystemConfig error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 11. Update Dynamic Platform Guardrails & System Config
export const updateSystemConfig = async (req, res) => {
  try {
    const allowedKeys = [
      'aiModel',
      'aiFallbackModel',
      'aiTemperature',
      'aiMaxTokens',
      'aiEnabled',
      'dailyCardLimit',
      'maxTextLength',
      'maintenanceMode',
      'maintenanceMessage',
      'announcementBanner',
      'announcementActive',
      'pushNotificationsEnabled'
    ];

    const updates = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    let config = await SystemConfig.findOne({ key: 'global_settings' });
    if (!config) {
      config = new SystemConfig({ key: 'global_settings', ...updates });
    } else {
      Object.assign(config, updates);
    }

    await config.save();
    SystemConfig.invalidateCache();

    res.status(STATUS_CODES.OK).json({
      message: 'Platform guardrails and configuration updated successfully',
      config: config.toObject()
    });
  } catch (error) {
    console.error('[Admin] updateSystemConfig error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 12. Full User Profile Editor
export const updateUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, customDailyLimit, currentStreak, maxStreak, isBlocked, blockedReason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    if (email && email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      const cleanEmail = email.toLowerCase().trim();
      const emailExists = await User.findOne({ email: cleanEmail, _id: { $ne: id } });
      if (emailExists) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: 'Email address already in use. An admin and user account cannot share the same email.'
        });
      }
      user.email = cleanEmail;
    }

    if (role && ['user', 'admin'].includes(role)) {
      if (req.user._id.toString() === id && role !== 'admin') {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Cannot demote your own administrator account' });
      }
      if (
        role === 'user' &&
        process.env.ADMIN_EMAIL &&
        user.email.toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase()
      ) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: 'Cannot demote the primary system administrator email to a regular user'
        });
      }
      user.role = role;
    }

    if (customDailyLimit !== undefined) {
      user.customDailyLimit = customDailyLimit === null || customDailyLimit === '' ? null : Number(customDailyLimit);
    }

    if (currentStreak !== undefined) user.currentStreak = Math.max(0, Number(currentStreak) || 0);
    if (maxStreak !== undefined) user.maxStreak = Math.max(0, Number(maxStreak) || 0);

    if (isBlocked !== undefined) {
      user.isBlocked = !!isBlocked;
      if (user.isBlocked) {
        user.blockedReason = blockedReason || 'Suspended by administrator';
        user.blockedAt = new Date();
        user.tokenVersion = (user.tokenVersion || 0) + 1;
      } else {
        user.blockedReason = '';
        user.blockedAt = null;
      }
    }

    await user.save();

    res.status(STATUS_CODES.OK).json({
      message: 'User updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason,
        customDailyLimit: user.customDailyLimit,
        currentStreak: user.currentStreak,
        maxStreak: user.maxStreak
      }
    });
  } catch (error) {
    console.error('[Admin] updateUserDetails error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 13. Permanently Delete User and Associated Data
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Administrators cannot delete their own account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    await Promise.all([
      User.deleteOne({ _id: id }),
      RecallItem.deleteMany({ userId: id }),
      Deck.deleteMany({ userId: id }),
      TokenUsage.deleteMany({ userId: id })
    ]);

    res.status(STATUS_CODES.OK).json({ message: 'User and all associated data permanently deleted' });
  } catch (error) {
    console.error('[Admin] deleteUser error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 14. Search & List Flashcards Across All Users
export const getAdminFlashcards = async (req, res) => {
  try {
    const page = Math.max(PAGINATION.DEFAULT_PAGE, parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(PAGINATION.DEFAULT_PAGE, parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const status = req.query.status;
    const deck = req.query.deck?.trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { selectedText: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'all') filter.status = status;
    if (deck && deck !== 'all') filter.deck = deck;

    const [total, cards] = await Promise.all([
      RecallItem.countDocuments(filter),
      RecallItem.find(filter)
        .populate('userId', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    res.status(STATUS_CODES.OK).json({
      cards: cards.map((c) => ({
        _id: c._id,
        userEmail: c.userId?.email || 'Unknown User',
        userId: c.userId?._id || c.userId,
        question: c.question,
        selectedText: c.selectedText,
        deck: c.deck,
        sourceUrl: c.sourceUrl,
        interval: c.interval,
        easinessFactor: c.easinessFactor,
        isGraduated: c.isGraduated,
        reviewCount: c.reviewCount,
        correctCount: c.correctCount,
        nextReviewAt: c.nextReviewAt,
        status: c.status,
        createdAt: c.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Admin] getAdminFlashcards error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 15. Edit Any Flashcard
export const updateAdminFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question,
      selectedText,
      deck,
      sourceUrl,
      interval,
      easinessFactor,
      isGraduated,
      nextReviewAt,
      status
    } = req.body;

    const card = await RecallItem.findById(id);
    if (!card) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Flashcard not found' });
    }

    if (question !== undefined) card.question = question;
    if (selectedText !== undefined) card.selectedText = selectedText;
    if (deck !== undefined) card.deck = deck.trim() || 'General';
    if (sourceUrl !== undefined) card.sourceUrl = sourceUrl;
    if (interval !== undefined) card.interval = Math.max(0, Number(interval) || 0);
    if (easinessFactor !== undefined) card.easinessFactor = Math.max(1.3, Number(easinessFactor) || 2.5);
    if (isGraduated !== undefined) card.isGraduated = !!isGraduated;
    if (nextReviewAt !== undefined) card.nextReviewAt = new Date(nextReviewAt);
    if (status && ['active', 'archived'].includes(status)) card.status = status;

    await card.save();

    res.status(STATUS_CODES.OK).json({ message: 'Flashcard updated successfully', card });
  } catch (error) {
    console.error('[Admin] updateAdminFlashcard error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 16. Delete Any Flashcard (Permanent or Soft)
export const deleteAdminFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const permanent = req.query.permanent === 'true';

    if (permanent) {
      await RecallItem.findByIdAndDelete(id);
      return res.status(STATUS_CODES.OK).json({ message: 'Flashcard permanently deleted' });
    }

    const card = await RecallItem.findById(id);
    if (!card) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Flashcard not found' });
    }

    card.status = card.status === 'archived' ? 'active' : 'archived';
    await card.save();

    res.status(STATUS_CODES.OK).json({
      message: card.status === 'archived' ? 'Flashcard archived' : 'Flashcard restored',
      status: card.status
    });
  } catch (error) {
    console.error('[Admin] deleteAdminFlashcard error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 17. List All Decks Across Platform
export const getAdminDecks = async (req, res) => {
  try {
    const decks = await Deck.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(STATUS_CODES.OK).json(
      decks.map((d) => ({
        _id: d._id,
        name: d.name,
        color: d.color,
        userEmail: d.userId?.email || 'Unknown User',
        userId: d.userId?._id || d.userId,
        createdAt: d.createdAt
      }))
    );
  } catch (error) {
    console.error('[Admin] getAdminDecks error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 18. Update Any Deck
export const updateAdminDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const deck = await Deck.findById(id);
    if (!deck) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Deck not found' });
    }

    const oldName = deck.name;
    if (name && name.trim()) deck.name = name.trim();
    if (color) deck.color = color;
    await deck.save();

    // If deck name changed, update all flashcards in that deck for this user
    if (name && name.trim() !== oldName) {
      await RecallItem.updateMany(
        { userId: deck.userId, deck: oldName },
        { $set: { deck: name.trim() } }
      );
    }

    res.status(STATUS_CODES.OK).json({ message: 'Deck updated successfully', deck });
  } catch (error) {
    console.error('[Admin] updateAdminDeck error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 19. Delete Any Deck (reassigns cards to General)
export const deleteAdminDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const deck = await Deck.findById(id);
    if (!deck) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Deck not found' });
    }

    await RecallItem.updateMany(
      { userId: deck.userId, deck: deck.name },
      { $set: { deck: 'General' } }
    );
    await Deck.findByIdAndDelete(id);

    res.status(STATUS_CODES.OK).json({ message: 'Deck deleted and cards reassigned to General' });
  } catch (error) {
    console.error('[Admin] deleteAdminDeck error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 20. Get Platform Failure Incidents
export const getAdminIncidents = async (req, res) => {
  try {
    const status = req.query.status;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const incidents = await SystemIncident.find(filter)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(STATUS_CODES.OK).json(
      incidents.map((inc) => ({
        _id: inc._id,
        type: inc.type,
        severity: inc.severity,
        message: inc.message,
        details: inc.details,
        userEmail: inc.userId?.email || 'N/A',
        userId: inc.userId?._id || null,
        jobId: inc.jobId || null,
        status: inc.status,
        resolvedAt: inc.resolvedAt,
        resolvedBy: inc.resolvedBy,
        createdAt: inc.createdAt
      }))
    );
  } catch (error) {
    console.error('[Admin] getAdminIncidents error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// 21. Resolve / Dismiss a Failure Incident
export const resolveAdminIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await SystemIncident.findById(id);
    if (!incident) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Incident not found' });
    }

    incident.status = 'resolved';
    incident.resolvedAt = new Date();
    incident.resolvedBy = req.user.email;
    await incident.save();

    res.status(STATUS_CODES.OK).json({
      message: 'Incident marked as resolved',
      incident
    });
  } catch (error) {
    console.error('[Admin] resolveAdminIncident error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
