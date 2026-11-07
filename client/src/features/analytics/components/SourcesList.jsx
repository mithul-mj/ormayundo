import { Globe } from 'lucide-react';

export default function SourcesList({ sources }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="text-purple-500 w-6 h-6" />
        <h2 className="text-xl font-bold">Top Sources</h2>
      </div>

      <div className="space-y-4">
        {sources.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No sources tracked yet.</p>
        ) : (
          sources.map((source, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 truncate">
                <div className={
      [
        'w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center',
        'text-purple-600 font-bold text-xs shrink-0'
      ].join(' ')
    }>
                  {idx + 1}
                </div>
                <span className="font-medium text-gray-700 truncate">{source.domain}</span>
              </div>
              <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full shrink-0">
                {source.count}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
