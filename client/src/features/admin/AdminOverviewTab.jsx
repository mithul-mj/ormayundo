import { useState } from 'react';
import {
  Users,
  Brain,
  Zap,
  DollarSign,
  Activity,
  CheckCircle,
  AlertTriangle,
  Layers,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TOKEN_METRICS } from '../../shared/constants';

export default function AdminOverviewTab({ stats, tokenAnalytics }) {
  const [chartMetric, setChartMetric] = useState('tokens'); // 'tokens' | 'generations' | 'cost'

  if (!stats) return null;

  const { users, flashcards, tokens, queue } = stats;
  const dailyData = stats?.tokens?.daily || tokenAnalytics?.daily || [];

  // Card Mastery distribution for donut chart
  const graduatedCount = flashcards?.graduated || 0;
  const learningCount = flashcards?.learning || Math.max(0, (flashcards?.total || 0) - graduatedCount);
  const archivedCount = flashcards?.archived || 0;
  const totalCardsCalculated = graduatedCount + learningCount + archivedCount;

  const masteryData = [
    { name: 'Graduated (>21d)', value: graduatedCount, color: '#10B981' },
    { name: 'In Review / Learning', value: learningCount, color: '#FF385C' },
    { name: 'Archived', value: archivedCount, color: '#9CA3AF' },
  ].filter((item) => item.value > 0);

  // Top decks volume
  const topDecks = flashcards?.topDecks || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Total Users</span>
            <Users className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
            {users?.total?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-semibold text-emerald-600">
              {users?.activeToday || 0} active today
            </span>
            <span>•</span>
            <span className="text-red-500 font-semibold">
              {users?.blocked || 0} blocked
            </span>
          </div>
        </div>

        {/* Total Flashcards */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Total Cards</span>
            <Brain className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
            {flashcards?.total?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {flashcards?.graduated || 0} graduated
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {flashcards?.totalDecks || 0} decks
            </span>
          </div>
        </div>

        {/* Groq AI Tokens */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">AI Tokens</span>
            <Zap className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
            {tokens?.totalTokens ? tokens.totalTokens.toLocaleString() : '0'}
          </div>
          <div className="text-xs text-neutral-500">
            <span>
              {tokens?.totalGenerations?.toLocaleString() || 0} generations
            </span>
            <span className="ml-1 text-purple-600 font-semibold">
              ({tokens?.completionTokens?.toLocaleString() || 0} output)
            </span>
          </div>
        </div>

        {/* Estimated AI Cost */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Est. AI Cost</span>
            <DollarSign className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
            ${tokens?.estimatedCost !== undefined ? tokens.estimatedCost.toFixed(TOKEN_METRICS.COST_DECIMALS) : '0.0000'}
          </div>
          <div className="text-xs text-neutral-500 flex items-center justify-between">
            <span>Dynamic key pool</span>
            <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Live</span>
          </div>
        </div>
      </div>

      {/* Primary Analytical Chart: Historical Trends with Metric View Switcher */}
      <div className="bg-white p-5 sm:p-6 lg:p-7 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neutral-900 shrink-0" />
              <h3 className="font-bold text-sm sm:text-base text-neutral-900">AI &amp; Flashcard Historical Trends (14 Days)</h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Analyze daily token consumption volumes, generation spikes, and cloud expense.
            </p>
          </div>

          {/* Metric View Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-100 rounded-full border border-gray-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setChartMetric('tokens')}
              className={[
                'px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer',
                chartMetric === 'tokens' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900',
              ].join(' ')}
            >
              Token Burn
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('generations')}
              className={[
                'px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer',
                chartMetric === 'generations' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900',
              ].join(' ')}
            >
              Generations
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('cost')}
              className={[
                'px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer',
                chartMetric === 'cost' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900',
              ].join(' ')}
            >
              Cost ($)
            </button>
          </div>
        </div>

        {dailyData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'tokens' ? (
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF385C" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#FF385C" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="promptGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBEB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#717171' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#717171' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#222222',
                      borderRadius: '16px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                    }}
                    formatter={(val, name) => [
                      val.toLocaleString(),
                      name === 'totalTokens' ? 'Total Tokens' : 'Prompt Tokens',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalTokens"
                    stroke="#FF385C"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#tokenGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="promptTokens"
                    stroke="#8B5CF6"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#promptGrad)"
                  />
                </AreaChart>
              ) : chartMetric === 'generations' ? (
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBEB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#717171' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#717171' }} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#222222',
                      borderRadius: '16px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                    }}
                    formatter={(val) => [`${val} cards created`, 'Generations']}
                  />
                  <Bar dataKey="count" fill="#FF385C" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBEB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#717171' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#717171' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#222222',
                      borderRadius: '16px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                    }}
                    formatter={(val) => [`$${Number(val).toFixed(TOKEN_METRICS.COST_DECIMALS)}`, 'Daily Cost']}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#costGrad)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-muted text-xs">
            <AlertTriangle className="w-6 h-6 text-amber-400 mb-2" />
            <span>No historical token data recorded yet. Generate cards to view activity trends!</span>
          </div>
        )}
      </div>

      {/* 2-Column Analytical Chart Row: Mastery Donut & Top Decks Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 2: Spaced Repetition & Card Mastery Donut */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-neutral-900 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">Spaced Repetition &amp; Mastery</h3>
                  <p className="text-[11px] text-neutral-500">Retention lifecycle of created flashcards</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shrink-0">
                {totalCardsCalculated > 0
                  ? `${Math.round((graduatedCount / totalCardsCalculated) * TOKEN_METRICS.PERCENTAGE_BASE)}% Mastered`
                  : '0% Mastered'}
              </span>
            </div>

            {masteryData.length > 0 ? (
              <div className="h-60 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={masteryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {masteryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#222222',
                        borderRadius: '14px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                      formatter={(val, name) => [`${val} cards`, name]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Stat Inside Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                  <span className="text-xl sm:text-2xl font-black text-ink">{totalCardsCalculated}</span>
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Total Cards</span>
                </div>
              </div>
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-muted text-xs">
                <PieIcon className="w-6 h-6 text-muted mb-2" />
                <span>No flashcards recorded yet.</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Top Decks by Flashcard Volume */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-neutral-900 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">Deck Volume Distribution</h3>
                  <p className="text-[11px] text-neutral-500">Flashcard counts by knowledge category</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full border border-gray-200 shrink-0">
                {flashcards?.totalDecks || 0} Decks
              </span>
            </div>

            {topDecks.length > 0 ? (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topDecks}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EBEBEB" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#717171' }} tickLine={false} allowDecimals={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 11, fill: '#222222', fontWeight: 600 }}
                      tickLine={false}
                      width={68}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#222222',
                        borderRadius: '14px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                      formatter={(val) => [`${val} cards`, 'Flashcards']}
                    />
                    <Bar dataKey="count" fill="#FF385C" radius={[0, 8, 8, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-muted text-xs">
                <Layers className="w-6 h-6 text-muted mb-2" />
                <span>No deck distributions recorded yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BullMQ Background Queue Diagnostics */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-neutral-900 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-neutral-900">Background AI Queue Status (BullMQ)</h3>
              <p className="text-xs text-neutral-500">Worker Engine &bull; ai-flashcard-generation</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {queue ? 'Queue Ready' : 'Queue Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-2 border-t border-divider/60 mt-4">
          <div>
            <span className="text-xs text-muted block font-semibold">Waiting</span>
            <span className="text-xl sm:text-2xl font-extrabold text-ink mt-0.5 block">{queue?.waiting || 0}</span>
          </div>
          <div>
            <span className="text-xs text-muted block font-semibold">Active</span>
            <span className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-0.5 block">{queue?.active || 0}</span>
          </div>
          <div>
            <span className="text-xs text-muted block font-semibold">Completed</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5 block">{queue?.completed || 0}</span>
          </div>
          <div>
            <span className="text-xs text-muted block font-semibold">Failed</span>
            <span className={['text-xl sm:text-2xl font-extrabold mt-0.5 block', queue?.failed > 0 ? 'text-red-600' : 'text-muted'].join(' ')}>
              {queue?.failed || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
