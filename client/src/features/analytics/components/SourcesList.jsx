import { useMemo } from 'react';

export default function SourcesList({ sources = [] }) {
  const list = useMemo(() => {
    const raw = Array.isArray(sources) ? sources : [];
    if (raw.length === 0) return [];

    const maxCount = Math.max(...raw.map((s) => Number(s.count) || 0), 1);
    return raw.slice(0, 5).map((s, i) => {
      const count = Number(s.count) || 0;
      const pct = Math.max(3, Math.round((count / maxCount) * 100));
      return {
        name: s.domain || s.name || 'Unknown',
        count,
        pct,
        delay: (0.4 + i * 0.12).toFixed(2),
        isAccent: i === 0,
      };
    });
  }, [sources]);

  return (
    <div
      className="rise"
      style={{
        '--d': '0.15s',
        flex: '1 1 400px',
        minWidth: 0,
        background: 'var(--brain-surface)',
        border: '1px solid var(--brain-line)',
        borderRadius: '20px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        Top sources
      </h2>

      {list.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--brain-muted)', fontSize: '13px' }}>
          No sources tracked yet. Highlight text on any website using the extension to see top sources here.
        </div>
      ) : (
        <ol
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {list.map((s) => (
            <li
              key={s.name}
              className="group/src relative cursor-pointer"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {/* Tooltip on hover */}
              <div
                className="absolute -top-7 right-0 opacity-0 group-hover/src:opacity-100 transition-opacity duration-200 pointer-events-none bg-neutral-900 text-white text-[11px] px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 z-20 whitespace-nowrap"
              >
                <span>{s.count} {s.count === 1 ? 'card' : 'cards'} from {s.name}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <span
                  className="group-hover/src:text-neutral-950 transition-colors"
                  style={{
                    fontSize: '14px',
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.name}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{s.count}</span>
              </div>
              <div
                style={{
                  height: '4px',
                  borderRadius: '99px',
                  background: 'var(--brain-track)',
                }}
              >
                <div
                  className="hbar"
                  style={{
                    height: '4px',
                    borderRadius: '99px',
                    '--d': `${s.delay}s`,
                    width: `${s.pct}%`,
                    background: s.isAccent ? 'var(--brain-accent)' : 'var(--brain-bar)',
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
