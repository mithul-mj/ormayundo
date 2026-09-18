import RecallItem from '../models/recallItem.js';

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const cards = await RecallItem.find({ userId });

    let newCards = 0;
    let learningCards = 0;
    let relearningCards = 0;
    let masteredCards = 0;

    const sources = {};
    const heatmap = {};

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalReviews = 0;
    let hardForgotCount = 0;

    const upcoming = {
      'Today': 0,
      'Tomorrow': 0,
      'In 3 Days': 0,
      'Next Week': 0,
      'Later': 0
    };

    const timeBuckets = {
      Morning: { total: 0, correct: 0 },    // 5 AM - 12 PM
      Afternoon: { total: 0, correct: 0 },  // 12 PM - 5 PM
      Evening: { total: 0, correct: 0 },    // 5 PM - 9 PM
      Night: { total: 0, correct: 0 }       // 9 PM - 5 AM
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
        if (card.reviewCount === 0) {
          newCards++;
        } else if (card.correctCount === 0) {
          relearningCards++;
        } else if (card.interval >= 21) {
          masteredCards++;
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

      // 3 & 4. Heatmap & Retention (Include all historical reviews)
      card.reviewHistory.forEach(history => {
        if (history.reviewedAt >= thirtyDaysAgo) {
          const dateKey = history.reviewedAt.toISOString().split('T')[0];
          heatmap[dateKey] = (heatmap[dateKey] || 0) + 1;
        }

        totalReviews++;
        if (history.rating === 'hard' || history.rating === 'forgot') {
          hardForgotCount++;
        }
      });

      // 5. Workload (Active cards only)
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

    const heatmapData = Object.keys(heatmap).map(date => ({ date, count: heatmap[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const retentionRate = totalReviews > 0 ? Math.round(((totalReviews - hardForgotCount) / totalReviews) * 100) : 100;

    const workloadData = Object.keys(upcoming).map(day => ({ day, count: upcoming[day] }));

    // Read optimized Streak from Database
    const nowStreak = new Date();
    const todayStr = nowStreak.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const lastAddedStr = req.user.lastAddedDate ? new Date(req.user.lastAddedDate).toISOString().split('T')[0] : null;

    // If the last added date is older than yesterday, their streak is broken (0)
    let displayStreak = req.user.currentStreak || 0;
    if (lastAddedStr !== todayStr && lastAddedStr !== yesterdayStr) {
      displayStreak = 0;
    }

    // 🚀 OPTIMIZATION: MongoDB Aggregation Pipeline for Time of Day Accuracy
    const userTimezone = req.query.timezone || "UTC";
    const timeAggregation = await RecallItem.aggregate([
      { $match: { userId: req.user._id } },
      { $unwind: "$reviewHistory" },
      {
        $project: {
          hour: { $hour: { date: "$reviewHistory.reviewedAt", timezone: userTimezone } },
          isCorrect: {
            $in: ["$reviewHistory.rating", ["good", "easy"]]
          }
        }
      },
      {
        $addFields: {
          timeBucket: {
            $switch: {
              branches: [
                { case: { $and: [{ $gte: ["$hour", 5] }, { $lt: ["$hour", 12] }] }, then: "Morning" },
                { case: { $and: [{ $gte: ["$hour", 12] }, { $lt: ["$hour", 17] }] }, then: "Afternoon" },
                { case: { $and: [{ $gte: ["$hour", 17] }, { $lt: ["$hour", 21] }] }, then: "Evening" }
              ],
              default: "Night"
            }
          }
        }
      },
      {
        $group: {
          _id: "$timeBucket",
          total: { $sum: 1 },
          correct: { $sum: { $cond: ["$isCorrect", 1, 0] } }
        }
      }
    ]);

    // Format accuracy by time
    const accuracyBuckets = { 
      "Morning": { accuracy: 0, total: 0, correct: 0 }, 
      "Afternoon": { accuracy: 0, total: 0, correct: 0 }, 
      "Evening": { accuracy: 0, total: 0, correct: 0 }, 
      "Night": { accuracy: 0, total: 0, correct: 0 } 
    };
    timeAggregation.forEach(bucket => {
      const accuracy = bucket.total > 0 ? Math.round((bucket.correct / bucket.total) * 100) : 0;
      accuracyBuckets[bucket._id] = { accuracy, total: bucket.total, correct: bucket.correct };
    });

    const accuracyByTime = [
      { time: "Morning", ...accuracyBuckets["Morning"] },
      { time: "Afternoon", ...accuracyBuckets["Afternoon"] },
      { time: "Evening", ...accuracyBuckets["Evening"] },
      { time: "Night", ...accuracyBuckets["Night"] }
    ];

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
