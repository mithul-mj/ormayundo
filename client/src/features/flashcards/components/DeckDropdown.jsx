import { useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function DeckDropdown({
  currentDeck,
  decks = [],
  isOpen,
  onToggle,
  onSelectDeck,
  getDeckColor,
}) {
  const dropdownRef = useRef(null);
  const activeColor = getDeckColor ? getDeckColor(currentDeck) : '#FF385C';

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onToggle();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onToggle]);

  return (
    <div ref={dropdownRef} className="relative flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
        Deck
      </span>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer"
        style={{
          backgroundColor: `${activeColor}15`,
          color: activeColor,
          borderColor: `${activeColor}40`,
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: activeColor }}
        />
        <span>{currentDeck}</span>
        <ChevronDown
          className={[
            'w-3 h-3 ml-0.5 opacity-70 transition-transform duration-200',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 z-30 bg-white border border-divider rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-1.5 min-w-[150px] flex flex-col gap-0.5 animate-fade-in">
          {decks.map((d) => {
            const isDeckActive = currentDeck === d.name;
            const itemColor = d.color || '#FF385C';

            return (
              <button
                key={d._id || d.name}
                type="button"
                onClick={() => {
                  onSelectDeck(d.name);
                }}
                className={[
                  'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold w-full text-left transition-colors cursor-pointer',
                  isDeckActive ? 'bg-surface' : 'hover:bg-surface/80',
                ].join(' ')}
                style={{ color: itemColor }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: itemColor }}
                />
                <span className="truncate">{d.name}</span>
                {isDeckActive && (
                  <Check className="w-3.5 h-3.5 ml-auto shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
