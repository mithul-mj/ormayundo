export default function AnalyticsSummaryHeader({
  totalCards = 0,
  additionStreak = 0,
  maxStreak = 0,
  retentionRate = 100,
  dueTodayCount = 0,
  onNavigateToReview,
  formattedDate,
}) {
  const safeRetention = Math.max(0, Math.min(100, Math.round(Number(retentionRate) || 0)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Title & Subtitle */}
      <section className="rise" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(28px, 4vw, 40px)',
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: '-0.035em',
          }}
        >
          Your Brain Dashboard
        </h1>
        <p style={{ margin: 0, fontSize: '15px', color: 'var(--brain-muted)' }}>
          {totalCards} {totalCards === 1 ? 'flashcard' : 'flashcards'} · {formattedDate}
        </p>
      </section>

      {/* KPI Metric Strip */}
      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {/* 1. Creation streak */}
        <div
          className="rise"
          style={{
            '--d': '0.1s',
            flex: '1 1 240px',
            padding: '24px 24px 24px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            cursor: 'default',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--brain-muted)',
            }}
          >
            Creation streak
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              style={{
                fontSize: '44px',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}
            >
              {additionStreak}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--brain-muted)' }}>
              {additionStreak === 1 ? 'day' : 'days'} · best {maxStreak}
            </span>
          </div>
        </div>

        {/* 2. Retention rate */}
        <div
          className="rise sm:border-l border-[var(--brain-line)]"
          style={{
            '--d': '0.2s',
            flex: '1 1 240px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            cursor: 'default',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--brain-muted)',
              }}
            >
              Retention rate
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span
                style={{
                  fontSize: '44px',
                  fontWeight: 600,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}
              >
                {safeRetention}
              </span>
              <span style={{ fontSize: '20px', color: 'var(--brain-muted)' }}>%</span>
            </div>
          </div>

          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            role="img"
            aria-label={`Retention rate ${safeRetention} percent`}
          >
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              style={{ stroke: 'var(--brain-track)' }}
              strokeWidth="5"
            />
            {safeRetention > 0 && (
              <circle
                className="seg"
                pathLength="100"
                cx="32"
                cy="32"
                r="26"
                fill="none"
                style={{
                  stroke: 'var(--brain-accent)',
                  '--v': safeRetention,
                  '--d': '0.5s',
                }}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${safeRetention} 100`}
                transform="rotate(-90 32 32)"
              />
            )}
          </svg>
        </div>

        {/* 3. Due today */}
        <div
          className="rise lg:border-l border-[var(--brain-line)]"
          style={{
            '--d': '0.3s',
            flex: '1 1 240px',
            padding: '24px 0 24px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            cursor: 'default',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--brain-muted)',
              }}
            >
              Due today
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontSize: '44px',
                  fontWeight: 600,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}
              >
                {dueTodayCount}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--brain-muted)' }}>
                {dueTodayCount === 1 ? 'card' : 'cards'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToReview}
            style={{
              border: 0,
              padding: '11px 22px',
              borderRadius: '999px',
              background: 'var(--brain-accent)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            className="hover:opacity-90 active:scale-95 shadow-xs"
          >
            Review
          </button>
        </div>
      </section>
    </div>
  );
}
