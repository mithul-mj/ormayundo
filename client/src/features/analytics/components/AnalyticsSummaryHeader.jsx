import { Flame } from 'lucide-react';

export default function AnalyticsSummaryHeader({
  totalCards,
  additionStreak,
  maxStreak,
  retentionRate,
}) {
  const safeRetention = Number(retentionRate) || 0;
  const strokeOffset = 125.6 - (safeRetention / 100) * 125.6;

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Brain Dashboard</h1>
        <p className="text-gray-500 mt-1">Total Flashcards: {totalCards || 0}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        {/* Streak Card */}
        <div className={
      [
        'bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex',
        'items-center gap-5 hover:shadow-md transition-shadow relative',
        'overflow-hidden'
      ].join(' ')
    }>
          <div className="text-brand-light">
            <Flame className="w-8 h-8 fill-brand-light/20" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
              Creation Streak
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-gray-900 tracking-tighter">
                {additionStreak || 0}
              </p>
              <span className={
      [
        'text-xs font-bold text-brand-light bg-brand-light/10 border',
        'border-brand-light/20 px-2 py-0.5 rounded-full shadow-sm'
      ].join(' ')
    }>
                Max {maxStreak || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Retention Card */}
        <div className={
      [
        'bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex',
        'items-center gap-5 hover:shadow-md transition-shadow relative',
        'overflow-hidden'
      ].join(' ')
    }>
          <div className="flex items-center justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              className="transform -rotate-90 drop-shadow-sm"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#f3f4f6"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="url(#retentionGradient)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="125.6"
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="retentionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
              Retention Rate
            </p>
            <p className={
      [
        'text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br',
        'from-gray-800 to-gray-600 tracking-tighter'
      ].join(' ')
    }>
              {retentionRate || 0}
              <span className="text-xl text-gray-400 font-bold ml-0.5">%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
