import { Pencil, Trash2, X, Save, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DeckDropdown from './DeckDropdown';

export default function FlashcardCard({
  card,
  decks,
  isEditing,
  editForm,
  openDeckDropdown,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  onDelete,
  onEditFormChange,
  onToggleDeckDropdown,
  getDeckColor,
}) {
  const cardDeckColor = getDeckColor(card.deck);

  return (
    <div className={
      [
        'bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border',
        'border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all',
        'duration-300 flex flex-col md:flex-row gap-6'
      ].join(' ')
    }>
      <div className="flex-1 space-y-5">
        {/* Question Header & Deck Badge */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-brand flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand" /> Question
            </h3>

            {isEditing ? (
              <DeckDropdown
                currentDeck={editForm.deck || 'General'}
                decks={decks}
                isOpen={openDeckDropdown === card._id}
                onToggle={() => onToggleDeckDropdown(card._id)}
                onSelectDeck={(deckName) => {
                  onEditFormChange({ ...editForm, deck: deckName });
                  onToggleDeckDropdown(null);
                }}
                getDeckColor={getDeckColor}
              />
            ) : (
              <span
                style={{
                  backgroundColor: `${cardDeckColor}18`,
                  color: cardDeckColor,
                }}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1"
              >
                <Tag className="w-3 h-3" /> {card.deck || 'General'}
              </span>
            )}
          </div>

          {isEditing ? (
            <input
              type="text"
              value={editForm.question}
              onChange={(e) =>
                onEditFormChange({ ...editForm, question: e.target.value })
              }
              className={
      [
        'w-full p-3 border border-gray-200 rounded-xl text-lg font-bold shadow-inner',
        'focus:ring-2 focus:ring-brand-light/20 focus:border-brand-light',
        'focus:outline-none transition-all'
      ].join(' ')
    }
            />
          ) : (
            <p className="text-xl font-bold text-gray-900 leading-tight">
              {card.question}
            </p>
          )}
        </div>

        {/* Answer Section */}
        <div>
          {isEditing ? (
            <textarea
              value={editForm.selectedText}
              onChange={(e) =>
                onEditFormChange({ ...editForm, selectedText: e.target.value })
              }
              rows={6}
              className={
      [
        'w-full p-4 border border-gray-200 rounded-xl font-mono text-sm',
        'text-gray-700 bg-gray-50/50 shadow-inner focus:ring-2',
        'focus:ring-brand-light/20 focus:border-brand-light focus:outline-none',
        'transition-all'
      ].join(' ')
    }
            />
          ) : (
            <div className={
      [
        'p-5 bg-gray-50/50 border border-gray-100 rounded-2xl shadow-sm max-h-72',
        'overflow-y-auto custom-scrollbar'
      ].join(' ')
    }>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ ...props }) => (
                    <table className="markdown-table" {...props} />
                  ),
                  a: ({ ...props }) => (
                    <a
                      className="text-brand-light font-medium hover:underline hover:text-brand transition-colors"
                      {...props}
                    />
                  ),
                  p: ({ ...props }) => (
                    <p className="text-gray-700 leading-relaxed mb-4 last:mb-0" {...props} />
                  ),
                }}
              >
                {card.selectedText}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex gap-4 text-xs text-gray-400 font-medium">
          <span>Reviews: {card.reviewCount}</span>
          <span>Next Review: {new Date(card.nextReviewAt).toLocaleDateString()}</span>
          {card.sourceUrl && (
            <a
              href={card.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand-light hover:underline"
            >
              Source Link
            </a>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex md:flex-col gap-2 shrink-0">
        {isEditing ? (
          <>
            <button
              onClick={() => onSaveEdit(card._id)}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
              title="Save changes"
            >
              <Save className="w-5 h-5" />
            </button>
            <button
              onClick={onCancelEditing}
              className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onStartEditing(card)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit card"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(card._id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete card"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
