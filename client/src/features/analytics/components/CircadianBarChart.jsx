import { useMemo } from 'react';

const STANDARD_TIMES = ['Morning', 'Afternoon', 'Evening', 'Night'];

export default function CircadianBarChart({ accuracyByTime = [] }) {
  const metrics = useMemo(() => {
    const raw = Array.isArray(accuracyByTime) && accuracyByTime.length > 0
      ? accuracyByTime
      : STANDARD_TIMES.map((time) => ({ time, accuracy: 0, total: 0, correct: 0 }));

    // Find highest accuracy with actual correct/reviews
    const maxAcc = Math.max(...raw.map((t) => Number(t.accuracy) || 0));
    const bestItem = maxAcc > 0 ? raw.find((t) => Number(t.accuracy) === maxAcc) : null;

    const bars = STANDARD_TIMES.map((slotName, i) => {
      const match = raw.find((r) => r.time && r.time.toLowerCase() === slotName.toLowerCase());
      const val = Math.max(0, Math.min(100, Math.round(Number(match?.accuracy) || 0)));
      const total = Number(match?.total) || 0;
      const correct = Number(match?.correct) || 0;
      const d = (0.4 + i * 0.12).toFixed(2);
      const isBest = bestItem && slotName.toLowerCase() === bestItem.time.toLowerCase();

      return {
        label: slotName,
        value: val,
        total,
        correct,
        delay: d,
        labelDelay: (parseFloat(d) + 0.7).toFixed(2),
        isBest,
        heightPx: Math.max(4, Math.round((val / 100) * 145)),
      };
    });

    return {
      bestLabel: bestItem ? bestItem.time : '—',
      bars,
    };
  }, [accuracyByTime]);

  return (
    <div
      className="rise"
      style={{
        '--d': '0.25s',
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
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          Accuracy by time of day
        </h2>
        <span style={{ fontSize: '12px', color: 'var(--brain-muted)' }}>
          Best: {metrics.bestLabel}
        </span>
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
        {metrics.bars.map((a) => (
          <div
            key={a.label}
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
                <div className="font-bold">{a.label}</div>
                <div className="text-[11px] text-neutral-300 font-normal">
                  {a.value}% accuracy {a.total > 0 ? `(${a.correct} / ${a.total} correct)` : ''}
                </div>
              </div>
              <div className="w-2 h-1 bg-neutral-900 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
            </div>

            <span
              className="fade transition-colors duration-200 group-hover/bar:text-neutral-950"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                '--d': `${a.labelDelay}s`,
              }}
            >
              {a.value}%
            </span>
            <div
              className="bar"
              style={{
                width: '100%',
                maxWidth: '72px',
                borderRadius: '10px 10px 3px 3px',
                '--d': `${a.delay}s`,
                height: `${a.heightPx}px`,
                background: a.isBest ? 'var(--brain-accent)' : 'var(--brain-bar)',
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        {metrics.bars.map((a) => (
          <span
            key={a.label}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--brain-muted)',
            }}
          >
            {a.label}
          </span>
        ))}
      </div>
    </div>
  );
}
