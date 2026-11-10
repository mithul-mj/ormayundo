import { useState, useMemo } from 'react';

export default function MasteryDonutChart({ masteryData = [], totalCards = 0 }) {
  const [hovered, setHovered] = useState(null);

  const metrics = useMemo(() => {
    const list = Array.isArray(masteryData) ? masteryData : [];
    const getVal = (key) => {
      const item = list.find((m) => m.name && m.name.toLowerCase() === key.toLowerCase());
      return Math.max(0, Number(item?.value) || 0);
    };

    const learning = getVal('learning');
    const newCount = getVal('new');
    const relearning = getVal('relearning');
    const mastered = getVal('mastered');
    const total = totalCards || (learning + newCount + relearning + mastered) || 0;

    const pLearning = total > 0 ? (learning / total) * 100 : 0;
    const pNew = total > 0 ? (newCount / total) * 100 : 0;
    const pRelearning = total > 0 ? (relearning / total) * 100 : 0;
    const pMastered = total > 0 ? (mastered / total) * 100 : 0;

    return {
      learning,
      newCount,
      relearning,
      mastered,
      total,
      pLearning: pLearning.toFixed(1),
      pNew: pNew.toFixed(1),
      pRelearning: pRelearning.toFixed(1),
      pMastered: pMastered.toFixed(1),
      offsetLearning: 0,
      offsetNew: (-pLearning).toFixed(1),
      offsetRelearning: (-(pLearning + pNew)).toFixed(1),
      offsetMastered: (-(pLearning + pNew + pRelearning)).toFixed(1),
    };
  }, [masteryData, totalCards]);

  const activeDisplay = hovered || {
    label: metrics.total === 1 ? 'card' : 'cards',
    count: metrics.total,
    pct: null,
  };

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
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          Knowledge mastery
        </h2>
        {hovered && (
          <span className="text-xs font-semibold text-neutral-500 animate-fade-in">
            {hovered.label}: {hovered.pct}%
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
        }}
      >
        <div className="relative flex items-center justify-center">
          {/* Floating Tooltip when hovering over any segment */}
          {hovered && (
            <div
              className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-200 z-30 flex flex-col items-center animate-fade-in"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}
            >
              <div className="bg-neutral-900 text-white text-xs px-2.5 py-1 rounded-lg whitespace-nowrap flex items-center gap-1.5 font-medium">
                <span className="font-bold text-white">{hovered.label}:</span>
                <span>{hovered.count} {hovered.count === 1 ? 'card' : 'cards'} ({hovered.pct}%)</span>
              </div>
              <div className="w-2 h-1 bg-neutral-900 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
            </div>
          )}

          <svg
            width="190"
            height="190"
            viewBox="0 0 200 200"
            role="img"
            aria-label={`Mastery split: ${metrics.learning} learning, ${metrics.newCount} new, ${metrics.relearning} relearning, ${metrics.mastered} mastered`}
          >
            {/* Base track circle */}
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              style={{ stroke: 'var(--brain-track)' }}
              strokeWidth="16"
            />

            {/* Learning (Amber) */}
            {metrics.learning > 0 && (
              <circle
                className="seg cursor-pointer"
                pathLength="100"
                cx="100"
                cy="100"
                r="72"
                fill="none"
                style={{
                  stroke: 'var(--brain-amber)',
                  '--v': metrics.pLearning,
                  '--d': '0.3s',
                  strokeWidth: hovered?.label === 'Learning' ? 19 : 16,
                  transition: 'stroke-width 0.2s ease',
                }}
                strokeDasharray={`${metrics.pLearning} 100`}
                strokeDashoffset={metrics.offsetLearning}
                transform="rotate(-90 100 100)"
                onMouseEnter={() =>
                  setHovered({ label: 'Learning', count: metrics.learning, pct: metrics.pLearning })
                }
                onMouseLeave={() => setHovered(null)}
              >
                <title>{`Learning: ${metrics.learning} cards (${metrics.pLearning}%)`}</title>
              </circle>
            )}

            {/* New (Blue) */}
            {metrics.newCount > 0 && (
              <circle
                className="seg cursor-pointer"
                pathLength="100"
                cx="100"
                cy="100"
                r="72"
                fill="none"
                style={{
                  stroke: 'var(--brain-blue)',
                  '--v': metrics.pNew,
                  '--d': '1s',
                  strokeWidth: hovered?.label === 'New' ? 19 : 16,
                  transition: 'stroke-width 0.2s ease',
                }}
                strokeDasharray={`${metrics.pNew} 100`}
                strokeDashoffset={metrics.offsetNew}
                transform="rotate(-90 100 100)"
                onMouseEnter={() =>
                  setHovered({ label: 'New', count: metrics.newCount, pct: metrics.pNew })
                }
                onMouseLeave={() => setHovered(null)}
              >
                <title>{`New: ${metrics.newCount} cards (${metrics.pNew}%)`}</title>
              </circle>
            )}

            {/* Relearning (Red) */}
            {metrics.relearning > 0 && (
              <circle
                className="seg cursor-pointer"
                pathLength="100"
                cx="100"
                cy="100"
                r="72"
                fill="none"
                style={{
                  stroke: 'var(--brain-red)',
                  '--v': metrics.pRelearning,
                  '--d': '1.35s',
                  strokeWidth: hovered?.label === 'Relearning' ? 19 : 16,
                  transition: 'stroke-width 0.2s ease',
                }}
                strokeDasharray={`${metrics.pRelearning} 100`}
                strokeDashoffset={metrics.offsetRelearning}
                transform="rotate(-90 100 100)"
                onMouseEnter={() =>
                  setHovered({ label: 'Relearning', count: metrics.relearning, pct: metrics.pRelearning })
                }
                onMouseLeave={() => setHovered(null)}
              >
                <title>{`Relearning: ${metrics.relearning} cards (${metrics.pRelearning}%)`}</title>
              </circle>
            )}

            {/* Mastered (Green) */}
            {metrics.mastered > 0 && (
              <circle
                className="seg cursor-pointer"
                pathLength="100"
                cx="100"
                cy="100"
                r="72"
                fill="none"
                style={{
                  stroke: 'var(--brain-green)',
                  '--v': metrics.pMastered,
                  '--d': '1.6s',
                  strokeWidth: hovered?.label === 'Mastered' ? 19 : 16,
                  transition: 'stroke-width 0.2s ease',
                }}
                strokeDasharray={`${metrics.pMastered} 100`}
                strokeDashoffset={metrics.offsetMastered}
                transform="rotate(-90 100 100)"
                onMouseEnter={() =>
                  setHovered({ label: 'Mastered', count: metrics.mastered, pct: metrics.pMastered })
                }
                onMouseLeave={() => setHovered(null)}
              >
                <title>{`Mastered: ${metrics.mastered} cards (${metrics.pMastered}%)`}</title>
              </circle>
            )}

            {/* Center Dynamic Metric Display */}
            <g className="fade pointer-events-none" style={{ '--d': '0.9s' }}>
              <text
                x="100"
                y="104"
                textAnchor="middle"
                style={{
                  fill: 'var(--brain-text)',
                  fontSize: '34px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                }}
              >
                {activeDisplay.count}
              </text>
              <text
                x="100"
                y="126"
                textAnchor="middle"
                style={{
                  fill: 'var(--brain-muted)',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                }}
              >
                {activeDisplay.label}
              </text>
            </g>
          </svg>
        </div>

        {/* Interactive Legend with Tooltip Sync */}
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            flex: '1 1 170px',
            minWidth: '170px',
          }}
        >
          <li
            className="fade cursor-pointer transition-opacity"
            style={{
              '--d': '0.5s',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              opacity: hovered && hovered.label !== 'Learning' ? 0.4 : 1,
            }}
            onMouseEnter={() =>
              setHovered({ label: 'Learning', count: metrics.learning, pct: metrics.pLearning })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--brain-amber)',
              }}
            />
            <span style={{ flex: 1 }}>Learning</span>
            <span style={{ fontWeight: 600 }}>{metrics.learning}</span>
          </li>

          <li
            className="fade cursor-pointer transition-opacity"
            style={{
              '--d': '1.1s',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              opacity: hovered && hovered.label !== 'New' ? 0.4 : 1,
            }}
            onMouseEnter={() =>
              setHovered({ label: 'New', count: metrics.newCount, pct: metrics.pNew })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--brain-blue)',
              }}
            />
            <span style={{ flex: 1 }}>New</span>
            <span style={{ fontWeight: 600 }}>{metrics.newCount}</span>
          </li>

          <li
            className="fade cursor-pointer transition-opacity"
            style={{
              '--d': '1.4s',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              opacity: hovered && hovered.label !== 'Relearning' ? 0.4 : 1,
            }}
            onMouseEnter={() =>
              setHovered({ label: 'Relearning', count: metrics.relearning, pct: metrics.pRelearning })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--brain-red)',
              }}
            />
            <span style={{ flex: 1 }}>Relearning</span>
            <span style={{ fontWeight: 600 }}>{metrics.relearning}</span>
          </li>

          <li
            className="fade cursor-pointer transition-opacity"
            style={{
              '--d': '1.7s',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              opacity: hovered && hovered.label !== 'Mastered' ? 0.4 : 1,
            }}
            onMouseEnter={() =>
              setHovered({ label: 'Mastered', count: metrics.mastered, pct: metrics.pMastered })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--brain-green)',
              }}
            />
            <span style={{ flex: 1 }}>Mastered</span>
            <span style={{ fontWeight: 600 }}>{metrics.mastered}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
