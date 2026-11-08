import { Award, Clock, Zap, Cpu, DollarSign, Layers, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
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

const MODEL_PALETTE = ['#FF385C', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#06B6D4'];

export default function AdminTokensTab({ tokenAnalytics }) {
  const totals = tokenAnalytics?.totals || {
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    estimatedCost: 0,
    totalGenerations: 0,
  };
  const leaderboard = tokenAnalytics?.leaderboard || [];
  const recentLogs = tokenAnalytics?.recentLogs || [];
  const dailyData = tokenAnalytics?.daily || [];
  const modelsData = tokenAnalytics?.models || [];

  const maxLeaderboardTokens = leaderboard[0]?.totalTokens || 1;

  // Format model data for donut chart
  const modelChartData = modelsData.map((m, idx) => ({
    name: m.model.split('/').pop(),
    fullName: m.model,
    value: m.totalTokens,
    cost: m.cost,
    color: MODEL_PALETTE[idx % MODEL_PALETTE.length],
  }));

  const displayModelData = modelChartData.length > 0
    ? modelChartData
    : [{ name: 'No Model Data', value: 1, color: '#E5E7EB' }];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Token Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Processed</span>
            <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-1">
            {totals.totalTokens.toLocaleString()}
          </div>
          <span className="text-xs text-muted font-medium">Across all flashcard requests</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Prompt / Input</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 tracking-tight mb-1">
            {totals.promptTokens.toLocaleString()}
          </div>
          <span className="text-xs text-muted font-medium">Highlighted student text payloads</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completion / Output</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight mb-1">
            {totals.completionTokens.toLocaleString()}
          </div>
          <span className="text-xs text-muted font-medium">AI generated questions & answers</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Groq Incurred Cost</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight mb-1">
            ${totals.estimatedCost.toFixed(TOKEN_METRICS.COST_DECIMALS)}
          </div>
          <span className="text-xs text-muted font-medium">Based on open weights pricing</span>
        </div>
      </div>

      {/* Visual Analytics Row: Stacked Token Burn & Model Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Daily Stacked Prompt vs Completion Tokens (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-ink">Daily Prompt vs Completion Token Burn</h3>
                <p className="text-[11px] text-muted">Input context payload vs output question token breakdown</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-purple-600">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Prompt
              </span>
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Completion
              </span>
            </div>
          </div>

          {dailyData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBEB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#717171' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#717171' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#222222',
                      borderRadius: '14px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val, name) => [
                      val.toLocaleString(),
                      name === 'promptTokens' ? 'Prompt Tokens' : 'Completion Tokens',
                    ]}
                  />
                  <Bar dataKey="promptTokens" stackId="a" fill="#8B5CF6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="completionTokens" stackId="a" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted text-xs">
              <Zap className="w-6 h-6 text-muted mb-2" />
              <span>No historical token distributions recorded yet.</span>
            </div>
          )}
        </div>

        {/* Chart 2: Model Consumption Share Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-divider">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand flex items-center justify-center">
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink">AI Model Consumption</h3>
                  <p className="text-[11px] text-muted">Tokens processed per Groq model</p>
                </div>
              </div>
            </div>

            <div className="h-60 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayModelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {displayModelData.map((entry, index) => (
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
                    formatter={(val, name, item) => [
                      `${val.toLocaleString()} tokens ($${Number(item?.payload?.cost || 0).toFixed(TOKEN_METRICS.COST_DECIMALS)})`,
                      item?.payload?.fullName || name,
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                <span className="text-xl font-black text-ink">{totals.totalTokens.toLocaleString()}</span>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Leaderboard & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Token Consumers (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-sm text-ink">Top Token Consumers</h3>
            </div>
            <span className="text-xs text-muted font-bold bg-surface px-2.5 py-0.5 rounded-full border border-divider">Leaderboard</span>
          </div>

          <div className="space-y-2">
            {leaderboard.length > 0 ? (
              leaderboard.map((item, index) => {
                const percentage = Math.round((item.totalTokens / maxLeaderboardTokens) * TOKEN_METRICS.PERCENTAGE_BASE);
                return (
                  <div key={item.userId} className="space-y-1 py-2 px-1 hover:bg-surface/50 rounded-xl transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-surface font-bold text-muted flex items-center justify-center text-[10px] shrink-0">
                          {index + 1}
                        </span>
                        <span className="font-bold text-ink truncate max-w-[140px] sm:max-w-[180px]" title={item.email}>
                          {item.email}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-ink">{item.totalTokens.toLocaleString()}</span>
                        <span className="text-muted text-[10px] block font-medium">${item.estimatedCost.toFixed(TOKEN_METRICS.COST_DECIMALS)}</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-brand to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-muted text-xs">
                No token consumption recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Live Generation Event Log (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand" />
              <h3 className="font-extrabold text-sm text-ink">Recent Generation Events</h3>
            </div>
            <span className="text-xs text-muted font-bold bg-surface px-2.5 py-0.5 rounded-full border border-divider">Latest 20</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 border-b border-divider text-muted uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Question</th>
                  <th className="py-3 px-3">Deck</th>
                  <th className="py-3 px-3 text-right">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-ink max-w-[120px] truncate" title={log.userEmail}>
                        {log.userEmail}
                      </td>
                      <td className="py-3 px-3 text-ink max-w-[180px] truncate" title={log.question}>
                        {log.question}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-surface text-ink text-[10px] font-bold border border-divider">
                          {log.deck}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-purple-600 text-right">
                        {log.totalTokens}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-muted">
                      No generation events recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
