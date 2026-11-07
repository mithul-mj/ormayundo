import { ChevronDown, Check } from 'lucide-react';

export default function DeckDropdown({
  currentDeck,
  decks,
  isOpen,
  onToggle,
  onSelectDeck,
  getDeckColor,
}) {
  const activeColor = getDeckColor(currentDeck);

  return (
    <div className="relative flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Deck
      </span>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all"
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
        {currentDeck}
        <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
      </button>

      {isOpen && (
        <div className={
      [
        'absolute top-full right-0 mt-1 z-20 bg-white border border-gray-100',
        'rounded-2xl shadow-xl p-1.5 min-w-[140px] flex flex-col gap-0.5'
      ].join(' ')
    }>
          {decks.map((d) => {
            const isDeckActive = currentDeck === d.name;
            const itemColor = d.color || '#FF9532';

            return (
              <button
                key={d._id || d.name}
                type="button"
                onClick={() => onSelectDeck(d.name)}
                className={
      [
        'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold w-full',
        'text-left transition-colors hover:bg-gray-50'
      ].join(' ')
    }
                style={{ color: itemColor }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: itemColor }}
                />
                {d.name}
                {isDeckActive && (
                  <Check className="w-3.5 h-3.5 ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
