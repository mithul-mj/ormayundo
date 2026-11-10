import { Pencil, Trash2, X, Save, Tag, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DeckDropdown from './DeckDropdown';

const getSourceDomain = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./i, '') || url;
  } catch {
    return 'Source';
  }
};

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
        'duration-300 flex flex-col md:flex-row gap-6 min-w-0 max-w-full'
      ].join(' ')
    }>
      <div className="flex-1 min-w-0 space-y-5">
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
            <p className="text-xl font-bold text-gray-900 leading-tight break-words">
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
            <div className="py-1 max-h-72 overflow-y-auto overflow-x-auto custom-scrollbar">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ ...props }) => (
                    <div className="w-full overflow-x-auto my-3 rounded-xl border border-gray-100">
                      <table className="markdown-table !my-0 w-full" {...props} />
                    </div>
                  ),
                  pre: ({ ...props }) => (
                    <div className="w-full overflow-x-auto my-3 rounded-xl">
                      <pre className="p-3 bg-gray-900 text-gray-100 rounded-xl text-xs font-mono" {...props} />
                    </div>
                  ),
                  code: ({ inline, ...props }) =>
                    inline ? (
                      <code className="bg-gray-100 text-brand px-1.5 py-0.5 rounded text-xs font-mono break-all" {...props} />
                    ) : (
                      <code {...props} />
                    ),
                  a: ({ ...props }) => (
                    <a
                      className="text-brand-light font-medium hover:underline hover:text-brand transition-colors break-all"
                      {...props}
                    />
                  ),
                  p: ({ ...props }) => (
                    <p className="text-gray-700 leading-relaxed mb-4 last:mb-0 break-words" {...props} />
                  ),
                }}
              >
                {card.selectedText}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-medium">
          <span>Reviews: {card.reviewCount}</span>
          <span>Next Review: {new Date(card.nextReviewAt).toLocaleDateString()}</span>
          {card.sourceUrl && (
            <a
              href={card.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-brand hover:underline font-medium"
            >
              <span>{getSourceDomain(card.sourceUrl)}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
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
