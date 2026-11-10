import { useMemo } from 'react';

const STANDARD_DAYS = ['Today', 'Tomorrow', 'In 3 days', 'Next week', 'Later'];

const cleanDayLabel = (raw) => {
  if (!raw) return '';
  const lower = raw.trim().toLowerCase();
  if (lower === 'today') return 'Today';
  if (lower === 'tomorrow') return 'Tomorrow';
  if (lower === 'in 3 days') return 'In 3 days';
  if (lower === 'next week') return 'Next week';
  if (lower === 'later') return 'Later';
  return raw;
};

export default function WorkloadChart({ workloadData = [] }) {
  const bars = useMemo(() => {
    const list = Array.isArray(workloadData) && workloadData.length > 0
      ? workloadData.map((w) => ({
          label: cleanDayLabel(w.day || w.label || ''),
          value: Math.max(0, Number(w.count ?? w.value) || 0),
        }))
      : STANDARD_DAYS.map((day) => ({ label: day, value: 0 }));

    const maxVal = Math.max(...list.map((w) => w.value), 1);

    return list.map((w, i) => {
      const d = (0.4 + i * 0.12).toFixed(2);
      const heightPx = Math.max(4, Math.round((w.value / maxVal) * 145));
      return {
        label: w.label,
        value: w.value,
        d,
        labelDelay: (parseFloat(d) + 0.7).toFixed(2),
        heightPx,
        isAccent: i === 0,
      };
    });
  }, [workloadData]);

  return (
    <div
      className="rise"
      style={{
        '--d': '0.25s',
        flex: '1.2 1 440px',
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
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          Upcoming workload
        </h2>
        <span style={{ fontSize: '12px', color: 'var(--brain-muted)' }}>Cards due</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '16px',
          height: '190px',
          borderBottom: '1px solid var(--brain-line)',
        }}
      >
        {bars.map((w) => (
          <div
            key={w.label}
            className="group/bar relative"
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            {/* Sleek Tooltip on Hover */}
            <div
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-all duration-200 z-30 flex flex-col items-center"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}
            >
              <div className="bg-neutral-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap text-center">
                <span className="text-neutral-400 font-medium">{w.label}: </span>
                <span className="font-bold text-white">{w.value} {w.value === 1 ? 'card' : 'cards'}</span>
              </div>
              <div className="w-2 h-1 bg-neutral-900 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
            </div>

            <span
              className="fade transition-colors duration-200 group-hover/bar:text-neutral-950"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                '--d': `${w.labelDelay}s`,
              }}
            >
              {w.value}
            </span>

            <div
              className="bar"
              style={{
                width: '100%',
                maxWidth: '56px',
                borderRadius: '10px 10px 3px 3px',
                '--d': `${w.d}s`,
                height: `${w.heightPx}px`,
                background: w.isAccent ? 'var(--brain-accent)' : 'var(--brain-bar)',
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        {bars.map((w) => (
          <span
            key={w.label}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--brain-muted)',
            }}
          >
            {w.label}
          </span>
        ))}
      </div>
    </div>
  );
}
