import { FolderPlus, X } from 'lucide-react';

export default function DeckFilterBar({
  cards,
  decks,
  selectedDeck,
  onSelectDeck,
  onOpenNewDeckModal,
  onDeleteDeck,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 pb-1 border-b border-gray-100">
      <button
        onClick={() => onSelectDeck('All')}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
          selectedDeck === 'All'
            ? 'bg-gray-900 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All Decks ({cards.length})
      </button>

      {decks.map((deck) => {
        const count = cards.filter((c) => (c.deck || 'General') === deck.name).length;
        const isGeneral = deck.name.toLowerCase() === 'general';
        const isSelected = selectedDeck === deck.name;

        return (
          <div key={deck._id || deck.name} className="group relative flex items-center">
            <button
              onClick={() => onSelectDeck(deck.name)}
              style={{
                backgroundColor: isSelected ? deck.color : `${deck.color}18`,
                color: isSelected ? '#FFFFFF' : deck.color,
              }}
              className={[
                'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                'flex items-center gap-1.5 shadow-sm',
                !isGeneral ? 'pr-8' : '',
              ].filter(Boolean).join(' ')}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isSelected ? '#FFFFFF' : deck.color }}
              />
              {deck.name} ({count})
            </button>

            {!isGeneral && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDeck(deck);
                }}
                title={`Delete deck "${deck.name}"`}
                className={
      [
        'absolute right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1',
        'rounded-full hover:bg-black/10'
      ].join(' ')
    }
                style={{ color: isSelected ? '#FFFFFF' : deck.color }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}

      <button
        onClick={onOpenNewDeckModal}
        className={
      [
        'px-3 py-1.5 border border-dashed border-gray-300 hover:border-brand-light',
        'hover:text-brand-light text-gray-400 rounded-xl text-xs font-bold',
        'transition-all flex items-center gap-1.5'
      ].join(' ')
    }
      >
        <FolderPlus className="w-3.5 h-3.5" /> New Deck
      </button>
    </div>
  );
}
