export default function PillBadge({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  pulse = false,
  className = '',
}) {
  const variants = {
    brand: 'bg-rose-50 text-brand border-rose-200/60',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/60',
    danger: 'bg-red-50 text-red-700 border-red-200/60',
    info: 'bg-blue-50 text-blue-700 border-blue-200/60',
    neutral: 'bg-surface text-ink/80 border-divider',
    dark: 'bg-ink text-white border-transparent',
  }[variant] || 'bg-surface text-ink/80 border-divider';

  const dotColors = {
    brand: 'bg-brand',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-muted',
    dark: 'bg-white',
  }[variant] || 'bg-muted';

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  }[size] || 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-bold border transition-colors select-none',
        variants,
        sizes,
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={[
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors,
            pulse ? 'animate-pulse' : '',
          ].join(' ')}
        />
      )}
      {children}
    </span>
  );
}

