import { Search, X } from 'lucide-react';

export default function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search...',
  onClear,
  variant = 'pill', // 'pill' | 'rounded'
  className = '',
  disabled = false,
}) {
  const roundedClass = variant === 'pill' ? 'rounded-full' : 'rounded-2xl';

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={['relative flex items-center', className].join(' ')}>
      <Search className="w-4 h-4 text-muted absolute left-3.5 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={[
          'w-full pl-9 pr-9 py-2 bg-surface text-ink text-xs font-medium border border-divider transition-all focus:outline-hidden focus:border-ink focus:bg-white',
          roundedClass,
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 w-4 h-4 rounded-full flex items-center justify-center text-muted hover:text-ink cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

