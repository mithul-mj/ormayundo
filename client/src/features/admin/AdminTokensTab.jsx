import { Award, Clock } from 'lucide-react';

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

  const maxLeaderboardTokens = leaderboard[0]?.totalTokens || 1;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Token Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-divider shadow-xs">
          <span className="text-xs font-bold uppercase text-muted tracking-wider block mb-2">
            Total Tokens Processed
          </span>
          <div className="text-3xl font-extrabold text-ink tracking-tight mb-1">
            {totals.totalTokens.toLocaleString()}
          </div>
          <span className="text-xs text-muted">Across all AI flashcard requests</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-divider shadow-xs">
          <span className="text-xs font-bold uppercase text-muted tracking-wider block mb-2">
            Prompt / Input Tokens
          </span>
          <div className="text-3xl font-extrabold text-purple-600 tracking-tight mb-1">
            {totals.promptTokens.toLocaleString()}
          </div>
          <span className="text-xs text-muted">Highlighted text + prompt payloads</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-divider shadow-xs">
          <span className="text-xs font-bold uppercase text-muted tracking-wider block mb-2">
            Completion / Output Tokens
          </span>
          <div className="text-3xl font-extrabold text-blue-600 tracking-tight mb-1">
            {totals.completionTokens.toLocaleString()}
          </div>
          <span className="text-xs text-muted">AI-generated questions & deck names</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-divider shadow-xs">
          <span className="text-xs font-bold uppercase text-muted tracking-wider block mb-2">
            Total Incurred Cost
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 tracking-tight mb-1">
            ${totals.estimatedCost.toFixed(4)}
          </div>
          <span className="text-xs text-muted">Based on Groq open-weights pricing</span>
        </div>
      </div>

      {/* Grid: Leaderboard & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Token Consumers (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-divider shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-ink">Top Token Consumers</h3>
            </div>
            <span className="text-xs text-muted">Leaderboard</span>
          </div>

          <div className="space-y-4">
            {leaderboard.length > 0 ? (
              leaderboard.map((item, index) => {
                const percentage = Math.round((item.totalTokens / maxLeaderboardTokens) * 100);
                return (
                  <div key={item.userId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-surface font-bold text-muted flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-ink truncate max-w-[160px]" title={item.email}>
                          {item.email}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-ink">{item.totalTokens.toLocaleString()} tokens</span>
                        <span className="text-muted text-[11px] block">${item.estimatedCost.toFixed(4)}</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-muted text-xs">
                No token consumption recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Live Generation Event Log (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-divider shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand" />
              <h3 className="font-bold text-sm text-ink">Recent AI Generation Logs</h3>
            </div>
            <span className="text-xs text-muted">Last 20 requests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 border-b border-divider text-muted uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Generated Question</th>
                  <th className="py-2.5 px-3">Deck</th>
                  <th className="py-2.5 px-3">Tokens</th>
                  <th className="py-2.5 px-3">Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-surface/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-ink max-w-[120px] truncate" title={log.userEmail}>
                        {log.userEmail}
                      </td>
                      <td className="py-2.5 px-3 text-ink max-w-[180px] truncate" title={log.question}>
                        {log.question}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-surface text-muted text-[11px] font-semibold">
                          {log.deck}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-purple-600">
                        {log.totalTokens}
                      </td>
                      <td className="py-2.5 px-3 text-muted text-[10px] truncate max-w-[90px]" title={log.model}>
                        {log.model.split('/')[1] || log.model}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-muted">
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
