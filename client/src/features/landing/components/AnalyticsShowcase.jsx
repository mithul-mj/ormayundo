import { Maximize2 } from 'lucide-react';

export default function AnalyticsShowcase({ onOpenModal, onGetStarted }) {
  return (
    <section id="showcase-dashboard" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-14">
          <span className={
      [
        'text-[11px] font-bold text-brand tracking-widest uppercase bg-brand/10',
        'px-3.5 py-1.5 rounded-full'
      ].join(' ')
    }>
            Web Dashboard Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mt-3 mb-3">
            Your Brain Dashboard & Memory Analytics
          </h2>
          <p className="text-muted max-w-xl mx-auto text-sm sm:text-base">
            Real analytics from real users. Track your retention rate, creation streaks, and
            upcoming review workload across days and weeks.
          </p>
        </div>

        {/* Full Dashboard Screenshot in App Frame */}
        <div className={
      [
        'bg-white rounded-3xl border border-border-card',
        'shadow-[0_16px_40px_rgba(0,0,0,0.08)] overflow-hidden mb-10'
      ].join(' ')
    }>
          {/* App Frame Bar */}
          <div className="bg-surface px-6 py-3.5 border-b border-divider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              <span className="ml-3 text-xs font-bold text-ink hidden sm:inline">
                Ormayundo Analytics Hub
              </span>
            </div>

            <div className={
      [
        'bg-white border border-border-card rounded-full px-4 py-1 text-xs',
        'text-muted font-mono shadow-xs truncate max-w-xs'
      ].join(' ')
    }>
              ormayundo-app.vercel.app/app
            </div>

            <button
              onClick={onGetStarted}
              className="text-xs font-bold text-brand hover:underline cursor-pointer"
            >
              Open Dashboard →
            </button>
          </div>

          <div
            className="relative group cursor-pointer"
            onClick={() => onOpenModal('/images/dashboard-analytics.png')}
          >
            <img
              src="/images/dashboard-analytics.png"
              alt="Ormayundo Brain Analytics Dashboard"
              className="w-full h-auto block object-cover"
            />
            <div className={
      [
        'absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100',
        'transition-opacity flex items-center justify-center'
      ].join(' ')
    }>
              <span className={
      [
        'bg-white text-ink px-4 py-2 rounded-full font-bold text-xs shadow-lg flex',
        'items-center gap-1.5'
      ].join(' ')
    }>
                <Maximize2 className="w-3.5 h-3.5" /> View full resolution analytics
              </span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Highlight 1: Knowledge Mastery Donut */}
          <div className="bg-surface p-6 rounded-3xl border border-divider flex flex-col justify-between">
            <div>
              <span className={
      [
        'text-[10px] font-bold uppercase tracking-wider text-ink bg-white px-2.5',
        'py-1 rounded-full border border-border-card inline-block mb-3'
      ].join(' ')
    }>
                Donut Breakdown
              </span>
              <div className="rounded-2xl overflow-hidden border border-divider mb-4 bg-white p-2">
                <img
                  src="/images/part-analytics-mastery.png"
                  alt="Knowledge Mastery Donut Breakdown"
                  className="w-full h-auto object-contain cursor-pointer"
                  onClick={() => onOpenModal('/images/part-analytics-mastery.png')}
                />
              </div>
              <h4 className="font-extrabold text-ink text-sm mb-1">Knowledge Mastery Donut</h4>
              <p className="text-xs text-muted leading-relaxed">
                Real-time visual distribution dividing all your cards into: Learning, Mastered,
                New, and Relearning.
              </p>
            </div>
          </div>

          {/* Highlight 2: Upcoming Workload Forecast */}
          <div className="bg-surface p-6 rounded-3xl border border-divider flex flex-col justify-between">
            <div>
              <span className={
      [
        'text-[10px] font-bold uppercase tracking-wider text-ink bg-white px-2.5',
        'py-1 rounded-full border border-border-card inline-block mb-3'
      ].join(' ')
    }>
                Spaced Workload
              </span>
              <div className="rounded-2xl overflow-hidden border border-divider mb-4 bg-white p-2">
                <img
                  src="/images/part-analytics-workload.png"
                  alt="Upcoming Workload Spaced Repetition Chart"
                  className="w-full h-auto object-contain cursor-pointer"
                  onClick={() => onOpenModal('/images/part-analytics-workload.png')}
                />
              </div>
              <h4 className="font-extrabold text-ink text-sm mb-1">Upcoming Workload Forecast</h4>
              <p className="text-xs text-muted leading-relaxed">
                Bar chart showing review volume scheduled for Today, Tomorrow, in 3 Days, and Next
                Week based on SM-2 calculation.
              </p>
            </div>
          </div>

          {/* Highlight 3: Retention Rate & Streaks */}
          <div className="bg-surface p-6 rounded-3xl border border-divider flex flex-col justify-between">
            <div>
              <span className={
      [
        'text-[10px] font-bold uppercase tracking-wider text-ink bg-white px-2.5',
        'py-1 rounded-full border border-border-card inline-block mb-3'
      ].join(' ')
    }>
                Retention Metrics
              </span>
              <div className="rounded-2xl overflow-hidden border border-divider mb-4 bg-white p-2">
                <img
                  src="/images/part-analytics-streak-retention.png"
                  alt="Streak and Retention Rate 77%"
                  className="w-full h-auto object-contain cursor-pointer"
                  onClick={() => onOpenModal('/images/part-analytics-streak-retention.png')}
                />
              </div>
              <h4 className="font-extrabold text-ink text-sm mb-1">77% Retention & Streak Tracker</h4>
              <p className="text-xs text-muted leading-relaxed">
                Gauge your long-term memory score and stay consistent with daily study streaks and
                milestone confetti rewards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
