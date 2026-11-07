import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import Confetti from 'react-confetti';
import { API_URL } from '../../shared/config';
import { themeColors } from '../../shared/theme';
import {
  AnalyticsSummaryHeader,
  MasteryDonutChart,
  WorkloadChart,
  RetentionAreaChart,
  SourcesList,
  CircadianBarChart,
} from './components';

const CONFETTI_MILESTONES = [3, 7, 14, 30, 50, 100, 365];

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
      if (CONFETTI_MILESTONES.includes(data.additionStreak)) {
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

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const res = await axios.get(`${API_URL}/analytics`, { withCredentials: true });
        if (!ignore) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-gray-500">
        Failed to load analytics data.
      </div>
    );
  }

  return (
    <div className="relative">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <Confetti
            width={windowDimension.width}
            height={windowDimension.height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
            colors={[
              themeColors.brandLight,
              themeColors.brand,
              '#ff8a8f',
              '#ffffff',
            ]}
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        <AnalyticsSummaryHeader
          totalCards={data.totalCards}
          additionStreak={data.additionStreak}
          maxStreak={data.maxStreak}
          retentionRate={data.retentionRate}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MasteryDonutChart masteryData={data.mastery} />
          <WorkloadChart workloadData={data.workload} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RetentionAreaChart heatmapData={data.heatmap} />
          <SourcesList sources={data.sources} />
        </div>

        <CircadianBarChart accuracyByTime={data.accuracyByTime} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

