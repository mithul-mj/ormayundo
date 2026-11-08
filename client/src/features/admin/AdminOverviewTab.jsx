import {
  Users,
  Brain,
  Zap,
  DollarSign,
  Activity,
  CheckCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AdminOverviewTab({ stats, tokenAnalytics }) {
  if (!stats) return null;

  const { users, flashcards, tokens, queue } = stats;
  const dailyData = tokenAnalytics?.daily || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-divider shadow-xs hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between text-muted mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-ink tracking-tight mb-1">
            {users?.total?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
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
        <div className="bg-white p-5 rounded-2xl border border-divider shadow-xs hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between text-muted mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Cards</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-ink tracking-tight mb-1">
            {flashcards?.total?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {flashcards?.graduated || 0} graduated
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {flashcards?.totalDecks || 0} decks
            </span>
          </div>
        </div>

        {/* Groq AI Tokens */}
        <div className="bg-white p-5 rounded-2xl border border-divider shadow-xs hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between text-muted mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">AI Tokens Consumed</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-ink tracking-tight mb-1">
            {tokens?.totalTokens ? tokens.totalTokens.toLocaleString() : '0'}
          </div>
          <div className="text-xs text-muted">
            <span>
              {tokens?.totalGenerations?.toLocaleString() || 0} AI generations
            </span>
            <span className="ml-1 text-purple-600 font-medium">
              ({tokens?.completionTokens?.toLocaleString() || 0} output tokens)
            </span>
          </div>
        </div>

        {/* Estimated AI Cost */}
        <div className="bg-white p-5 rounded-2xl border border-divider shadow-xs hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between text-muted mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Est. Groq Cost</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-ink tracking-tight mb-1">
            ${tokens?.estimatedCost !== undefined ? tokens.estimatedCost.toFixed(4) : '0.0000'}
          </div>
          <div className="text-xs text-muted flex items-center justify-between">
            <span>Groq open-weights rate</span>
            <span className="text-emerald-600 font-semibold text-[11px]">Pay-as-you-go</span>
          </div>
        </div>
      </div>

      {/* BullMQ Queue Quick Status */}
      <div className="bg-white p-5 rounded-2xl border border-divider shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand" />
            <h3 className="font-bold text-sm text-ink">Background AI Queue Status (BullMQ)</h3>
          </div>
          <span className="text-xs text-muted">Redis Queue: ai-flashcard-generation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface p-3 rounded-xl border border-divider/60">
            <span className="text-xs text-muted block font-medium">Waiting</span>
            <span className="text-lg font-bold text-ink">{queue?.waiting || 0}</span>
          </div>
          <div className="bg-surface p-3 rounded-xl border border-divider/60">
            <span className="text-xs text-muted block font-medium">Active</span>
            <span className="text-lg font-bold text-blue-600">{queue?.active || 0}</span>
          </div>
          <div className="bg-surface p-3 rounded-xl border border-divider/60">
            <span className="text-xs text-muted block font-medium">Completed</span>
            <span className="text-lg font-bold text-emerald-600">{queue?.completed || 0}</span>
          </div>
          <div className="bg-surface p-3 rounded-xl border border-divider/60">
            <span className="text-xs text-muted block font-medium">Failed</span>
            <span className={['text-lg font-bold', queue?.failed > 0 ? 'text-red-600' : 'text-muted'].join(' ')}>
              {queue?.failed || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Daily AI Token Consumption Chart */}
      <div className="bg-white p-6 rounded-2xl border border-divider shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-base text-ink">Daily Groq Token Consumption</h3>
            <p className="text-xs text-muted mt-0.5">
              Historical token usage trends across the platform
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand" />
              <span>Total Tokens</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Prompt Tokens</span>
            </div>
          </div>
        </div>

        {dailyData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9532" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF9532" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="promptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEB" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1E24',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  formatter={(val, name) => [
                    val.toLocaleString(),
                    name === 'totalTokens' ? 'Total Tokens' : 'Prompt Tokens',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="totalTokens"
                  stroke="#FF9532"
                  strokeWidth={2}
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
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-muted text-xs">
            <AlertTriangle className="w-6 h-6 text-amber-400 mb-2" />
            <span>No token usage events recorded yet. Highlight text on websites to generate flashcards!</span>
          </div>
        )}
      </div>
    </div>
  );
}

