export default function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  variant = 'brand',
  size = 'md',
  className = '',
  id,
}) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  // Dimensions by size
  const sizes = {
    sm: {
      track: 'w-9 h-5',
      thumb: 'w-3.5 h-3.5',
      translate: 'translate-x-4',
      offset: 'translate-x-0.5',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-4.5 h-4.5',
      translate: 'translate-x-5.5',
      offset: 'translate-x-0.5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-5.5 h-5.5',
      translate: 'translate-x-7.5',
      offset: 'translate-x-0.5',
    },
  }[size] || {
    track: 'w-11 h-6',
    thumb: 'w-4.5 h-4.5',
    translate: 'translate-x-5.5',
    offset: 'translate-x-0.5',
  };

  // Active track color by variant
  const activeColor = {
    brand: 'bg-brand shadow-xs shadow-brand/25',
    danger: 'bg-red-500 shadow-xs shadow-red-500/25',
    ink: 'bg-ink shadow-xs',
    success: 'bg-emerald-500 shadow-xs shadow-emerald-500/25',
  }[variant] || 'bg-brand';

  return (
    <div
      className={[
        'flex items-center justify-between gap-3',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer select-none',
        className,
      ].join(' ')}
      onClick={handleClick}
    >
      {(label || description) && (
        <div className="flex-1 pr-2">
          {label && (
            <span className="block text-xs font-bold text-ink leading-snug">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-[11px] text-muted leading-tight mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className={[
          'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
          sizes.track,
          checked ? activeColor : 'bg-neutral-200 hover:bg-neutral-300',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-in-out',
            sizes.thumb,
            checked ? sizes.translate : sizes.offset,
          ].join(' ')}
        />
      </button>
    </div>
  );
}

