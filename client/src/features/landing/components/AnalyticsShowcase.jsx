import { Maximize2, ArrowRight } from 'lucide-react';
import ModernCard from './ModernCard';
import ScrollReveal from './ScrollReveal';

export default function AnalyticsShowcase({ onOpenModal, onGetStarted }) {
  return (
    <section id="showcase-dashboard" className="py-10 sm:py-20 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <ScrollReveal className="text-center mb-8 sm:mb-14">
          <span className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand mb-2">
            Learning Analytics
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight mb-2 sm:mb-3">
            Measure what you retain, not just what you read
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto text-xs sm:text-base leading-relaxed">
            See your study streaks, memory score, and upcoming review schedule across days and weeks.
          </p>
        </ScrollReveal>

        {/* Full Dashboard Screenshot in App Frame (Desktop & Tablet) */}
        <ScrollReveal className="hidden md:block mb-8 sm:mb-10">
          <ModernCard hover={false} className="overflow-hidden">
            {/* App Frame Bar */}
            <div className="bg-neutral-50 px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-neutral-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-400 border border-rose-500/30" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 border border-amber-500/30" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 border border-emerald-500/30" />
                <span className="ml-1 sm:ml-2 text-xs font-semibold text-neutral-900 hidden md:inline">
                  Personal Dashboard
                </span>
              </div>

              <div className="hidden sm:block bg-white border border-neutral-200/80 rounded-full px-3 sm:px-4 py-1 text-[11px] sm:text-xs text-neutral-500 font-mono shadow-2xs truncate min-w-0 flex-1 max-w-xs text-center">
                ormayundo-app.vercel.app/app
              </div>

              <button
                type="button"
                onClick={onGetStarted}
                className="text-xs font-semibold text-neutral-900 hover:text-brand flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap transition-colors"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div
              className="relative group cursor-pointer"
              onClick={() => onOpenModal('/images/dashboard-analytics.png')}
            >
              <img
                src="/images/dashboard-analytics.png"
                alt="Ormayundo Brain Analytics Dashboard"
                loading="lazy"
                className="w-full h-auto block object-cover"
              />
              <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-neutral-900 px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-md flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" /> View full resolution
                </span>
              </div>
            </div>
          </ModernCard>
        </ScrollReveal>

        {/* Feature Highlights - 3 Column Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Highlight 1: Knowledge Mastery Donut */}
          <ScrollReveal delay={0}>
            <ModernCard variant="subtle" className="p-4 sm:p-6 flex flex-col justify-between h-full">
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  Card Progress
                </span>
                <div className="rounded-xl overflow-hidden border border-neutral-200/80 mb-3 sm:mb-4 bg-white p-2 h-36 sm:h-48 flex items-center justify-center">
                  <img
                    src="/images/part-analytics-mastery.png"
                    alt="Knowledge Mastery Donut Breakdown"
                    loading="lazy"
                    className="max-h-full max-w-full object-contain cursor-pointer hover:scale-103 transition-transform duration-200"
                    onClick={() => onOpenModal('/images/part-analytics-mastery.png')}
                  />
                </div>
                <h4 className="font-bold text-neutral-950 text-sm sm:text-base mb-1">Learning Progress</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  See how many cards you are currently learning, mastering, or reviewing at a glance.
                </p>
              </div>
            </ModernCard>
          </ScrollReveal>

          {/* Highlight 2: Upcoming Workload Forecast */}
          <ScrollReveal delay={80}>
            <ModernCard variant="subtle" className="p-4 sm:p-6 flex flex-col justify-between h-full">
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  Upcoming Reviews
                </span>
                <div className="rounded-xl overflow-hidden border border-neutral-200/80 mb-3 sm:mb-4 bg-white p-2 h-36 sm:h-48 flex items-center justify-center">
                  <img
                    src="/images/part-analytics-workload.png"
                    alt="Upcoming Workload Spaced Repetition Chart"
                    loading="lazy"
                    className="max-h-full max-w-full object-contain cursor-pointer hover:scale-103 transition-transform duration-200"
                    onClick={() => onOpenModal('/images/part-analytics-workload.png')}
                  />
                </div>
                <h4 className="font-bold text-neutral-950 text-sm sm:text-base mb-1">Study Schedule</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  See exactly how many cards are scheduled for today, tomorrow, and the week ahead so you are never overwhelmed.
                </p>
              </div>
            </ModernCard>
          </ScrollReveal>

          {/* Highlight 3: Retention Rate & Streaks */}
          <ScrollReveal delay={160}>
            <ModernCard variant="subtle" className="p-4 sm:p-6 flex flex-col justify-between h-full">
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  Memory Score
                </span>
                <div className="rounded-xl overflow-hidden border border-neutral-200/80 mb-3 sm:mb-4 bg-white p-2 h-36 sm:h-48 flex items-center justify-center">
                  <img
                    src="/images/part-analytics-streak-retention.png"
                    alt="Streak and Retention Rate 77%"
                    loading="lazy"
                    className="max-h-full max-w-full object-contain cursor-pointer hover:scale-103 transition-transform duration-200"
                    onClick={() => onOpenModal('/images/part-analytics-streak-retention.png')}
                  />
                </div>
                <h4 className="font-bold text-neutral-950 text-sm sm:text-base mb-1">Streaks &amp; Retention Score</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Track your daily study habit with streaks and watch your long-term memory score improve over time.
                </p>
              </div>
            </ModernCard>
          </ScrollReveal>
        </div>

        {/* Mobile-Only Dashboard Button */}
        <div className="md:hidden text-center mt-6">
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline cursor-pointer"
          >
            <span>Open live dashboard analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
