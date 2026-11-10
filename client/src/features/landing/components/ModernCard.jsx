/**
 * Trending Modern Card Component
 * Minimal, clean SaaS card design with subtle ambient depth, top hairline sheen,
 * layered shadows, and smooth micro-lift hover interactions.
 */
export default function ModernCard({
  children,
  className = '',
  variant = 'default',
  accentColor = null,
  hover = true,
  onClick = null,
  ...props
}) {
  const isClickable = Boolean(onClick);

  // Variant base styles
  const variantStyles = {
    default: 'bg-white border-neutral-200/80',
    subtle: 'bg-neutral-50/70 border-neutral-200/80',
    glass: 'bg-white/80 backdrop-blur-sm border-neutral-200/70',
  }[variant] || 'bg-white border-neutral-200/80';

  // Accent-specific hover colors (used in science/rating cards, etc.)
  const accentHoverStyles = {
    rose: 'hover:bg-rose-50/50 hover:border-rose-300/90 hover:shadow-rose-100/60',
    orange: 'hover:bg-orange-50/50 hover:border-orange-300/90 hover:shadow-orange-100/60',
    blue: 'hover:bg-blue-50/50 hover:border-blue-300/90 hover:shadow-blue-100/60',
    emerald: 'hover:bg-emerald-50/50 hover:border-emerald-300/90 hover:shadow-emerald-100/60',
    brand: 'hover:bg-brand-50/40 hover:border-brand-300/90 hover:shadow-brand-100/50',
  }[accentColor] || '';

  // Hover effect styles
  const hoverStyles = hover
    ? accentColor
      ? `transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg ${accentHoverStyles}`
      : 'transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300/90 hover:shadow-[0_14px_32px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.02)]'
    : 'transition-colors duration-200';

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      className={`group relative rounded-2xl border ${variantStyles} ${hoverStyles} ${
        isClickable ? 'cursor-pointer select-none' : ''
      } shadow-[0_2px_8px_rgba(0,0,0,0.025),0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden ${className}`}
      {...props}
    >
      {/* Subtle top edge highlight (hairline sheen) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-300/70 to-transparent group-hover:via-neutral-400/80 transition-all duration-300"
      />

      {children}
    </div>
  );
}

