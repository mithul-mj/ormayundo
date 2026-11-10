import { useMemo } from 'react';

export default function RetentionAreaChart({ heatmapData = [] }) {
  const chartData = useMemo(() => {
    const rawList = Array.isArray(heatmapData) ? heatmapData : [];
    const activeDaysCount = rawList.filter((h) => Number(h.count) > 0).length;

    // If no review activity yet, render a clean baseline
    if (rawList.length === 0) {
      const today = new Date();
      const emptyPoints = [0, 1, 2, 3, 4].map((i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (4 - i) * 6);
        return {
          x: 80 + i * 217.5,
          y: 200,
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: 0,
          isPeak: false,
        };
      });

      return {
        activeDaysCount: 0,
        peakVal: 0,
        yTicks: [15, 10, 5, 0],
        points: emptyPoints,
        pathD: 'M80 200 L950 200',
        areaD: 'M80 200 L950 200 L950 200 L80 200 Z',
      };
    }

    // Dynamic points from real backend review history
    const slice = rawList.slice(-6);
    const maxCount = Math.max(...slice.map((s) => Number(s.count) || 0), 1);

    // Compute dynamic Y ticks
    const step = Math.max(1, Math.ceil(maxCount / 3));
    const yTicks = [step * 3, step * 2, step, 0];

    const xStep = slice.length > 1 ? 870 / (slice.length - 1) : 0;
    const points = slice.map((item, idx) => {
      const count = Number(item.count) || 0;
      const x = Math.round(80 + idx * xStep);
      // y ranges from 50 (peak) to 200 (baseline 0)
      const ratio = count / (yTicks[0] || maxCount);
      const y = Math.round(200 - ratio * 150);
      const label = item.date
        ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : `Day ${idx + 1}`;
      return {
        x,
        y,
        label,
        count,
        isPeak: count === maxCount && count > 0,
      };
    });

    // Construct smooth cubic bezier curve
    let pathD = `M${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = Math.round(p0.x + (p1.x - p0.x) / 2);
      const cp1y = p0.y;
      const cp2x = cp1x;
      const cp2y = p1.y;
      pathD += ` C${cp1x} ${cp1y},${cp2x} ${cp2y},${p1.x} ${p1.y}`;
    }

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const areaD = `${pathD} L${lastX} 200 L${firstX} 200 Z`;

    return {
      activeDaysCount,
      peakVal: maxCount,
      yTicks,
      points,
      pathD,
      areaD,
    };
  }, [heatmapData]);

  return (
    <section
      className="rise"
      style={{
        '--d': '0.2s',
        background: 'var(--brain-surface)',
        border: '1px solid var(--brain-line)',
        borderRadius: '20px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '8px',
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
          Learning consistency
        </h2>
        <span style={{ fontSize: '12px', color: 'var(--brain-muted)' }}>
          Last 30 days · {chartData.activeDaysCount}{' '}
          {chartData.activeDaysCount === 1 ? 'active day' : 'active days'}
        </span>
      </div>

      <svg
        viewBox="0 0 1000 240"
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        role="img"
        aria-label="Activity over the last 30 days"
      >
        <defs>
          <linearGradient id="brainAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--brain-accent)', stopOpacity: 0.16 }} />
            <stop offset="100%" style={{ stopColor: 'var(--brain-accent)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        <line x1="44" y1="30" x2="980" y2="30" style={{ stroke: 'var(--brain-line)' }} />
        <line x1="44" y1="95" x2="980" y2="95" style={{ stroke: 'var(--brain-line)' }} />
        <line x1="44" y1="160" x2="980" y2="160" style={{ stroke: 'var(--brain-line)' }} />
        <line x1="44" y1="200" x2="980" y2="200" style={{ stroke: 'var(--brain-line)' }} />

        {/* Y Axis Numeric Ticks */}
        <text
          x="30"
          y="34"
          textAnchor="end"
          style={{ fill: 'var(--brain-muted)', fontSize: '12px', fontFamily: 'inherit' }}
        >
          {chartData.yTicks[0]}
        </text>
        <text
          x="30"
          y="99"
          textAnchor="end"
          style={{ fill: 'var(--brain-muted)', fontSize: '12px', fontFamily: 'inherit' }}
        >
          {chartData.yTicks[1]}
        </text>
        <text
          x="30"
          y="164"
          textAnchor="end"
          style={{ fill: 'var(--brain-muted)', fontSize: '12px', fontFamily: 'inherit' }}
        >
          {chartData.yTicks[2]}
        </text>
        <text
          x="30"
          y="204"
          textAnchor="end"
          style={{ fill: 'var(--brain-muted)', fontSize: '12px', fontFamily: 'inherit' }}
        >
          {chartData.yTicks[3]}
        </text>

        {/* Gradient Fill under curve */}
        <path
          className="fade"
          style={{ '--d': '1.6s' }}
          d={chartData.areaD}
          fill="url(#brainAreaFill)"
        />

        {/* Main Drawn Trend Line */}
        <path
          className="line"
          pathLength="1"
          d={chartData.pathD}
          fill="none"
          style={{ stroke: 'var(--brain-accent)' }}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Animated Data Points with Interactive Hover Tooltips */}
        {chartData.points.map((pt, idx) => {
          const delays = ['0.5s', '0.95s', '1.4s', '1.7s', '2s'];
          const delay = delays[idx] || `${(0.5 + idx * 0.35).toFixed(2)}s`;

          return (
            <g key={`pt-${idx}`} className="group/dot cursor-pointer">
              {/* Native title tooltip */}
              <title>{`${pt.label}: ${pt.count} ${pt.count === 1 ? 'card' : 'cards'} reviewed`}</title>

              {/* Peak elements */}
              {pt.isPeak ? (
                <>
                  <circle
                    className="dot"
                    style={{ '--d': delay, fill: 'var(--brain-accent)' }}
                    cx={pt.x}
                    cy={pt.y}
                    r="6.5"
                  />
                  <circle
                    className="ping"
                    cx={pt.x}
                    cy={pt.y}
                    r="6.5"
                    style={{ fill: 'var(--brain-accent)' }}
                  />
                  <text
                    className="fade"
                    style={{
                      '--d': '1.1s',
                      fill: 'var(--brain-text)',
                      fontSize: '13px',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                    }}
                    x={pt.x}
                    y={pt.y - 20}
                    textAnchor="middle"
                  >
                    {chartData.peakVal}
                  </text>
                </>
              ) : (
                <circle
                  className="dot"
                  style={{
                    '--d': delay,
                    fill: 'var(--brain-surface)',
                    stroke: 'var(--brain-accent)',
                  }}
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  strokeWidth="2"
                />
              )}

              {/* Invisible touch/hover target to make hovering easy */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="18"
                fill="transparent"
              />

              {/* Floating Tooltip Box on Hover */}
              <g
                className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none"
                transform={`translate(${pt.x}, ${pt.y - 38})`}
              >
                <rect
                  x="-55"
                  y="-14"
                  width="110"
                  height="28"
                  rx="7"
                  fill="#111318"
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.18))"
                />
                <polygon
                  points="-4,14 4,14 0,18"
                  fill="#111318"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="inherit"
                >
                  {pt.label}: {pt.count} {pt.count === 1 ? 'review' : 'reviews'}
                </text>
              </g>
            </g>
          );
        })}

        {/* X Axis Date labels */}
        {chartData.points.map((pt, idx) => (
          <text
            key={`lbl-${idx}`}
            x={pt.x}
            y="226"
            textAnchor="middle"
            style={{ fill: 'var(--brain-muted)', fontSize: '12px', fontFamily: 'inherit' }}
          >
            {pt.label}
          </text>
        ))}
      </svg>
    </section>
  );
}
