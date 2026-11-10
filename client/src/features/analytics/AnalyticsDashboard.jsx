import { useState, useEffect, useMemo } from 'react';
import Confetti from 'react-confetti';
import { useAnalyticsQuery } from './api/analyticsApi';
import { STREAK_MILESTONES } from '../../shared/constants';
import {
  AnalyticsSummaryHeader,
  MasteryDonutChart,
  WorkloadChart,
  RetentionAreaChart,
  SourcesList,
  CircadianBarChart,
  AnalyticsSkeleton,
} from './components';

export default function AnalyticsDashboard({ onNavigateToReview }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimension, setWindowDimension] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const { data, isLoading: loading } = useAnalyticsQuery();

  useEffect(() => {
    const handleResize = () =>
      setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let timeoutId;
    let confettiTimer;
    if (data && data.additionStreak > 0) {
      if (STREAK_MILESTONES.includes(data.additionStreak)) {
        const lastConfetti = localStorage.getItem('lastConfettiDate');
        const today = new Date().toDateString();
        if (lastConfetti !== today) {
          timeoutId = setTimeout(() => {
            setShowConfetti(true);
            localStorage.setItem('lastConfettiDate', today);
          }, 0);
          confettiTimer = setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    }
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(confettiTimer);
    };
  }, [data]);

  // Formatted date string (e.g. "Tuesday, 10 November")
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, []);

  // Compute due today count dynamically from workload
  const dueTodayCount = useMemo(() => {
    if (!data?.workload) return 0;
    const todayItem = data.workload.find((w) => (w.day || w.label || '').toLowerCase() === 'today');
    return Math.max(0, Number(todayItem?.count ?? todayItem?.value) || 0);
  }, [data]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  // 100% Dynamic data from backend API
  const totalCards = Math.max(0, Number(data?.totalCards) || 0);
  const additionStreak = Math.max(0, Number(data?.additionStreak) || 0);
  const maxStreak = Math.max(0, Number(data?.maxStreak) || 0);
  const retentionRate = typeof data?.retentionRate === 'number' ? data.retentionRate : 100;

  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--brain-bg)',
        color: 'var(--brain-text)',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <Confetti
            width={windowDimension.width}
            height={windowDimension.height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
            colors={['#D92D4A', '#FF385C', '#3FB68B', '#5B8DEF', '#E8A33D']}
          />
        </div>
      )}

      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '24px 20px 72px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}
        className="sm:px-8"
      >
        {/* Title & KPI Strip Component */}
        <AnalyticsSummaryHeader
          totalCards={totalCards}
          additionStreak={additionStreak}
          maxStreak={maxStreak}
          retentionRate={retentionRate}
          dueTodayCount={dueTodayCount}
          onNavigateToReview={onNavigateToReview}
          formattedDate={formattedDate}
        />

        {/* Row 1: Knowledge Mastery & Upcoming Workload Components */}
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <MasteryDonutChart
            masteryData={data?.mastery || []}
            totalCards={totalCards}
          />
          <WorkloadChart
            workloadData={data?.workload || []}
          />
        </section>

        {/* Row 2: Learning Consistency Area Chart Component */}
        <RetentionAreaChart
          heatmapData={data?.heatmap || []}
        />

        {/* Row 3: Top Sources & Accuracy by Time Components */}
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <SourcesList
            sources={data?.sources || []}
          />
          <CircadianBarChart
            accuracyByTime={data?.accuracyByTime || []}
          />
        </section>
      </div>
    </div>
  );
}
