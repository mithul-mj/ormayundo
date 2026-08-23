import RecallItem from '../models/recallItem.js';

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const cards = await RecallItem.find({ userId });

    let newCards = 0;
    let learningCards = 0;
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
    
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDays = new Date(now); threeDays.setDate(threeDays.getDate() + 3);
    const nextWeek = new Date(now); nextWeek.setDate(nextWeek.getDate() + 7);

    cards.forEach(card => {
      // 1. Mastery Breakdown
      if (card.reviewCount <= 1) newCards++;
      else {
         const interval = card.lastReviewedAt ? (card.nextReviewAt - card.lastReviewedAt) / (1000 * 60 * 60 * 24) : 0;
         if (interval > 21) masteredCards++;
         else learningCards++;
      }
      
      // 2. Top Sources
      if (card.sourceUrl) {
         try {
           const url = new URL(card.sourceUrl);
           const domain = url.hostname.replace('www.', '');
           sources[domain] = (sources[domain] || 0) + 1;
         } catch(e) {}
      }
      
      // 3 & 4. Heatmap & Retention
      card.reviewHistory.forEach(history => {
         if (history.reviewedAt >= thirtyDaysAgo) {
            const dateKey = history.reviewedAt.toISOString().split('T')[0];
            heatmap[dateKey] = (heatmap[dateKey] || 0) + 1;
         }
         
         totalReviews++;
         if (history.rating === 'hard' || history.rating === 'forgot') hardForgotCount++;
      });
      
      // 5. Workload
      if (card.nextReviewAt <= now) upcoming['Today']++;
      else if (card.nextReviewAt <= tomorrow) upcoming['Tomorrow']++;
      else if (card.nextReviewAt <= threeDays) upcoming['In 3 Days']++;
      else if (card.nextReviewAt <= nextWeek) upcoming['Next Week']++;
      else upcoming['Later']++;
    });

    const topSources = Object.keys(sources).map(domain => ({ domain, count: sources[domain] }))
         .sort((a,b) => b.count - a.count).slice(0, 5);
         
    const heatmapData = Object.keys(heatmap).map(date => ({ date, count: heatmap[date] }))
         .sort((a,b) => new Date(a.date) - new Date(b.date));
    
    const retentionRate = totalReviews > 0 ? Math.round(((totalReviews - hardForgotCount) / totalReviews) * 100) : 100;
    
    const workloadData = Object.keys(upcoming).map(day => ({ day, count: upcoming[day] }));

    res.json({
      mastery: [
        { name: 'New', value: newCards, fill: '#3b82f6' },
        { name: 'Learning', value: learningCards, fill: '#f59e0b' },
        { name: 'Mastered', value: masteredCards, fill: '#10b981' }
      ],
      sources: topSources,
      heatmap: heatmapData,
      retentionRate,
      workload: workloadData,
      totalCards: cards.length
    });

  } catch (error) {
    console.error('[Analytics Error]', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};
