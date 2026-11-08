import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  label,
  disabled = false,
  variant = 'pill', // 'pill' (rounded-full) | 'rounded' (rounded-2xl)
  size = 'md', // 'sm' | 'md'
  className = '',
  menuClassName = '',
  align = 'left', // 'left' | 'right'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to { value, label, icon, description, badge }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value,
      label: opt.label ?? String(opt.value),
      icon: opt.icon,
      description: opt.description,
      badge: opt.badge,
    };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    if (!disabled && onChange) {
      onChange(val);
      setIsOpen(false);
    }
  };

  const roundedStyle = variant === 'pill' ? 'rounded-full' : 'rounded-2xl';
  const paddingStyle =
    size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-xs';

  return (
    <div
      ref={containerRef}
      className={['relative inline-block text-left select-none', className].join(' ')}
    >
      {label && (
        <label className="block text-xs font-bold text-ink mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={[
          'w-full flex items-center justify-between gap-2.5 bg-surface border border-divider text-ink font-semibold transition-all cursor-pointer',
          roundedStyle,
          paddingStyle,
          isOpen ? 'border-ink bg-white shadow-xs' : 'hover:border-ink/50 hover:bg-white',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-muted">{selectedOption.icon}</span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={[
            'w-3.5 h-3.5 shrink-0 text-muted transition-transform duration-200',
            isOpen ? 'rotate-180 text-ink' : '',
          ].join(' ')}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className={[
            'absolute mt-1.5 z-50 bg-white border border-divider rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-1.5 min-w-full sm:min-w-[190px] max-h-64 overflow-y-auto animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName,
          ].join(' ')}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);

            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={[
                  'w-full text-left px-3.5 py-2 rounded-xl text-xs flex items-center justify-between gap-3 transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-surface font-bold text-ink'
                    : 'text-ink/80 hover:bg-surface hover:text-ink font-medium',
                ].join(' ')}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && <span className="shrink-0 text-muted">{opt.icon}</span>}
                  <div className="truncate">
                    <span className="block truncate">{opt.label}</span>
                    {opt.description && (
                      <span className="block text-[10px] text-muted font-normal truncate">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {opt.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-surface border border-divider text-[10px] font-bold text-muted">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

