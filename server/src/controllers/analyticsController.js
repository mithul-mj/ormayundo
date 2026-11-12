import RecallItem from '../models/recallItem.js';
import { getLocalDateString, getYesterdayLocalDateString, recordUserStudyActivity } from '../utils/streakHelper.js';

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const cards = await RecallItem.find({ userId }).select('-reviewHistory');

    let newCards = 0;
    let learningCards = 0;
    let relearningCards = 0;
    let masteredCards = 0;

    const sources = {};

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const upcoming = {
      'Today': 0,
      'Tomorrow': 0,
      'In 3 Days': 0,
      'Next Week': 0,
      'Later': 0
    };

    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    
    const endOfTomorrow = new Date(endOfToday);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    
    const endOfThreeDays = new Date(endOfToday);
    endOfThreeDays.setDate(endOfThreeDays.getDate() + 3);
    
    const endOfNextWeek = new Date(endOfToday);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

    cards.forEach(card => {
      // 1. Mastery Breakdown (Active cards only)
      if (card.status !== 'archived') {
        if (!card.reviewCount || card.reviewCount === 0) {
          newCards++;
        } else if (card.interval >= 21 || (card.isGraduated && card.interval >= 14)) {
          masteredCards++;
        } else if (card.reviewCount > 2 && card.correctCount === 0 && card.interval === 0) {
          relearningCards++;
        } else {
          learningCards++;
        }
      }

      // 2. Top Sources (Include all historical cards)
      if (card.sourceUrl) {
        try {
          const url = new URL(card.sourceUrl);
          const domain = url.hostname.replace('www.', '');
          sources[domain] = (sources[domain] || 0) + 1;
        } catch (e) { }
      }

      // 3. Workload (Active cards only)
      if (card.status !== 'archived') {
        if (card.nextReviewAt <= endOfToday) upcoming['Today']++;
        else if (card.nextReviewAt <= endOfTomorrow) upcoming['Tomorrow']++;
        else if (card.nextReviewAt <= endOfThreeDays) upcoming['In 3 Days']++;
        else if (card.nextReviewAt <= endOfNextWeek) upcoming['Next Week']++;
        else upcoming['Later']++;
      }
    });

    const topSources = Object.keys(sources).map(domain => ({ domain, count: sources[domain] }))
      .sort((a, b) => b.count - a.count).slice(0, 5);

    const userTimezone = req.query.timezone || req.headers['x-timezone'] || "UTC";
    const stats = req.user.studyStats || {};
    const dailyActivity = stats.dailyActivity || {};
    const thirtyDaysAgoStr = getLocalDateString(thirtyDaysAgo, userTimezone);

    const heatmapData = Object.keys(dailyActivity)
      .filter(date => date >= thirtyDaysAgoStr || new Date(date) >= thirtyDaysAgo)
      .map(date => ({ date, count: dailyActivity[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalReviews = stats.totalReviews || 0;
    const correctReviews = stats.correctReviews || 0;
    const retentionRate = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 100;

    const workloadData = Object.keys(upcoming).map(day => ({ day, count: upcoming[day] }));

    // Read optimized Streak from Database with timezone awareness & Rest Day Protection
    const todayStr = getLocalDateString(new Date(), userTimezone);
    const yesterdayStr = getYesterdayLocalDateString(new Date(), userTimezone);

    const lastActiveDate = req.user.lastStudiedDate || req.user.lastAddedDate;
    const lastActiveStr = lastActiveDate ? getLocalDateString(new Date(lastActiveDate), userTimezone) : null;

    // Check overdue and rest day status
    const activeCards = cards.filter(c => c.status !== 'archived');
    const hasPastDueCards = activeCards.some(
      (c) => c.nextReviewAt && getLocalDateString(new Date(c.nextReviewAt), userTimezone) < todayStr
    );
    const dueTodayCount = upcoming['Today'] || 0;
    const isAllCaughtUpToday = activeCards.length > 0 && dueTodayCount === 0 && !hasPastDueCards;
    const isRestDayProtected = activeCards.length > 0 && !hasPastDueCards && (req.user.currentStreak || 0) > 0;

    let displayStreak = req.user.currentStreak || 0;
    if (lastActiveStr === todayStr) {
      displayStreak = req.user.currentStreak || 0;
    } else if (lastActiveStr === yesterdayStr) {
      displayStreak = req.user.currentStreak || 0;
      // If user has zero cards due today and is all caught up, visiting automatically credits check-in
      if (isAllCaughtUpToday) {
        await recordUserStudyActivity(req.user, userTimezone);
        displayStreak = req.user.currentStreak || 0;
      }
    } else if (isRestDayProtected) {
      // Days between lastActive and today were rest days (0 cards were overdue)
      displayStreak = req.user.currentStreak || 0;
      if (isAllCaughtUpToday) {
        await recordUserStudyActivity(req.user, userTimezone, { isRestDayContinuance: true });
        displayStreak = req.user.currentStreak || 0;
      }
    } else {
      displayStreak = 0;
    }

    // Format accuracy by time of day directly from user studyStats
    const timeOfDay = stats.timeOfDay || {};
    const accuracyBuckets = { 
      "Morning": { accuracy: 0, total: 0, correct: 0 }, 
      "Afternoon": { accuracy: 0, total: 0, correct: 0 }, 
      "Evening": { accuracy: 0, total: 0, correct: 0 }, 
      "Night": { accuracy: 0, total: 0, correct: 0 } 
    };
    ["Morning", "Afternoon", "Evening", "Night"].forEach(bucket => {
      const b = timeOfDay[bucket] || { total: 0, correct: 0 };
      const accuracy = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
      accuracyBuckets[bucket] = { accuracy, total: b.total, correct: b.correct };
    });

    const accuracyByTime = [
      { time: "Morning", ...accuracyBuckets["Morning"] },
      { time: "Afternoon", ...accuracyBuckets["Afternoon"] },
      { time: "Evening", ...accuracyBuckets["Evening"] },
      { time: "Night", ...accuracyBuckets["Night"] }
    ];

    res.set('Cache-Control', 'private, max-age=30');
    res.json({
      mastery: [
        { name: 'New', value: newCards, fill: '#3b82f6' },
        { name: 'Learning', value: learningCards, fill: '#f59e0b' },
        { name: 'Relearning', value: relearningCards, fill: '#ef4444' },
        { name: 'Mastered', value: masteredCards, fill: '#10b981' }
      ],
      sources: topSources,
      heatmap: heatmapData,
      retentionRate,
      workload: workloadData,
      totalCards: cards.filter(c => c.status !== 'archived').length,
      additionStreak: displayStreak,
      maxStreak: req.user.maxStreak || 0,
      accuracyByTime
    });

  } catch (error) {
    console.error('[Analytics Error]', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};
