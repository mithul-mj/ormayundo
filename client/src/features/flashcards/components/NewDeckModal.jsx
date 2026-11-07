import { FolderPlus, X } from 'lucide-react';

const DECK_COLORS = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ec4899',
  '#f97316',
];

export default function NewDeckModal({
  isOpen,
  newDeckName,
  newDeckColor,
  onNameChange,
  onColorChange,
  onCreate,
  onClose,
}) {
  if (!isOpen) return null;

  const charactersRemaining = 3 - newDeckName.trim().length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-brand-light/10">
              <FolderPlus className="w-4 h-4 text-brand-light" />
            </div>
            <h2 className="text-sm font-bold text-gray-800">Create New Deck</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onCreate} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">
              Deck Name
            </label>
            <input
              type="text"
              placeholder="e.g. Biology, History..."
              value={newDeckName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && onClose()}
              autoFocus
              className={
      [
        'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold',
        'text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2',
        'focus:ring-brand-light/30 focus:border-brand-light transition-all'
      ].join(' ')
    }
            />
            {newDeckName.length > 0 && charactersRemaining > 0 && (
              <p className="text-[11px] text-amber-500 font-semibold mt-1.5 ml-1">
                {charactersRemaining} more character{charactersRemaining !== 1 ? 's' : ''} needed
              </p>
            )}

            {/* Colour dots */}
            <div className="flex items-center gap-2 mt-2.5">
              {DECK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onColorChange(c)}
                  className="w-5 h-5 rounded-full transition-all duration-150"
                  style={{
                    backgroundColor: c,
                    transform: newDeckColor === c ? 'scale(1.35)' : 'scale(1)',
                    boxShadow:
                      newDeckColor === c
                        ? `0 0 0 2px white, 0 0 0 3.5px ${c}`
                        : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={
      [
        'flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100',
        'hover:bg-gray-200 transition-colors'
      ].join(' ')
    }
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={newDeckName.trim().length < 3}
              className={
      [
        'flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-light',
        'hover:bg-brand transition-all disabled:opacity-40',
        'disabled:cursor-not-allowed'
      ].join(' ')
    }
            >
              Create Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
