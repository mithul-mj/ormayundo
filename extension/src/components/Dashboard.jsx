import { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  CheckCircle,
  Trash2,
  Maximize2,
  X,
  Pencil,
  Loader2,
  Check,
  AlertCircle,
  Tag
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api';
import { calculateIntervalsForCard } from '../services/spacedRepetition';
import { MESSAGES } from '../constants';

const Dashboard = ({ onLogout }) => {
  const [dueCards, setDueCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null }); // 'single' | 'all'

  // Question Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestion, setEditQuestion] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [cardsRes, decksRes] = await Promise.all([
        api.get('/recall/due'),
        api.get('/decks')
      ]);
      setDueCards(cardsRes.data);
      setDecks(decksRes.data);
    } catch (error) {
      console.error('Failed to fetch due cards:', error);
      if (error.isAuthError || error.response?.status === 401) {
        onLogout?.();
      } else {
        setFetchError(MESSAGES.ERROR.FETCH_FAILED);
      }
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const getDeckColor = (deckName) => {
    const found = decks.find(d => d.name.toLowerCase() === (deckName || 'general').toLowerCase());
    return found?.color || '#FF9532';
  };

  const getNextIntervalText = (ratingStr) => {
    if (!dueCards[currentCardIndex]) return '';
    const card = dueCards[currentCardIndex];
    const intervals = calculateIntervalsForCard(
      card.interval,
      card.correctCount,
      card.easinessFactor,
      card.learningStep,
      card.isGraduated
    );
    return intervals[ratingStr]?.text || '';
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2500);
  };

  const handleReview = async (rating) => {
    const card = dueCards[currentCardIndex];
    try {
      await api.post(`/recall/${card._id}/review`, { rating });

      // Move to next card
      setIsFlipped(false);
      setCurrentCardIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to submit review:', error);
      if (error.isAuthError || error.response?.status === 401) {
        onLogout?.();
      } else {
        showToast(MESSAGES.ERROR.NETWORK_ERROR);
      }
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setDeleteModal({ show: true, type: 'single' });
  };

  const confirmDeleteSingle = async () => {
    const card = dueCards[currentCardIndex];
    try {
      await api.delete(`/recall/${card._id}`);
      setDueCards((prev) => prev.filter((_, idx) => idx !== currentCardIndex));
      setIsFlipped(false);
      setDeleteModal({ show: false, type: null });
      showToast(MESSAGES.CARD_DELETED);
    } catch (error) {
      console.error('Failed to delete card:', error);
      showToast(MESSAGES.ERROR.DELETE_CARD_FAILED);
    }
  };

  const confirmDeleteAll = async () => {
    try {
      await api.delete('/recall/all');
      setDueCards([]);
      setIsFlipped(false);
      setDeleteModal({ show: false, type: null });
      showToast(MESSAGES.ALL_DELETED);
    } catch (error) {
      console.error('Failed to delete all cards:', error);
      showToast(MESSAGES.ERROR.DELETE_CARD_FAILED);
    }
  };

  // Open Edit Question Modal
  const handleOpenEdit = (e) => {
    if (e) e.stopPropagation();
    const card = dueCards[currentCardIndex];
    if (!card) return;
    setEditQuestion(card.question || '');
    setEditError(null);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditError(null);
  };

  const handleSaveEdit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!editQuestion.trim()) {
      setEditError(MESSAGES.EMPTY_QUESTION);
      return;
    }

    const card = dueCards[currentCardIndex];
    if (!card) return;

    setIsSaving(true);
    setEditError(null);

    try {
      const payload = {
        question: editQuestion.trim()
      };

      const { data } = await api.put(`/recall/${card._id}`, payload);

      setDueCards((prev) =>
        prev.map((c, idx) =>
          idx === currentCardIndex
            ? {
              ...c,
              question: data.question || editQuestion.trim()
            }
            : c
        )
      );

      setIsEditing(false);
      showToast(MESSAGES.CARD_SAVED);
    } catch (err) {
      console.error('Failed to update question:', err);
      setEditError(err.response?.data?.message || MESSAGES.ERROR.UPDATE_QUESTION_FAILED);
    } finally {
      setIsSaving(false);
    }
  }, [editQuestion, dueCards, currentCardIndex]);

  // Keyboard shortcut listener for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditing) return;
      if (e.key === 'Escape') {
        handleCloseEdit();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, handleSaveEdit]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">{MESSAGES.CHECKING_MEMORY}</div>;
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-full">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-base font-bold text-gray-800">Connection Error</h2>
        <p className="text-gray-500 mt-1 text-xs mb-4">{fetchError}</p>
        <button
          onClick={fetchCards}
          className="px-4 py-2 bg-[#FF385C] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If all caught up
  if (currentCardIndex >= dueCards.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">{MESSAGES.ALL_CAUGHT_UP}</h2>
        <p className="text-gray-500 mt-2 text-sm">{MESSAGES.NO_CARDS_DUE}</p>
      </div>
    );
  }

  const currentCard = dueCards[currentCardIndex];

  return (
    <div className="relative p-6 flex flex-col items-center h-full w-full overflow-hidden">
      {/* Toast Notification (Airbnb Black Pill) */}
      {toastMessage && (
        <div className="absolute top-4 z-50 bg-[#222222] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <Check className="w-3.5 h-3.5 text-[#008A05]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Edit Question Modal (Airbnb Style) */}
      {isEditing && (
        <div
          className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-5 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseEdit();
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-sm flex flex-col gap-3.5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <button
                onClick={handleCloseEdit}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#222222] transition-colors cursor-pointer -ml-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-[#222222] tracking-tight">Edit Question</h3>
              <div className="w-8" />
            </div>

            {/* Error Alert */}
            {editError && (
              <div className="flex items-center gap-2 text-xs bg-red-50 text-red-600 border border-red-200 p-3 rounded-2xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {/* Question Input */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold text-[#222222]">
                <span>Question Prompt</span>
                <span className="text-[11px] text-[#717171] font-normal">{editQuestion.length} characters</span>
              </div>
              <textarea
                autoFocus
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit(e);
                  }
                }}
                placeholder="What question will help you recall this?"
                rows={3}
                className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm font-medium text-[#222222] placeholder:text-gray-400 focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] resize-none transition-all"
              />
            </div>

            {/* Read-Only Answer Reference */}
            {currentCard?.selectedText && (
              <div className="bg-[#F7F7F7] border border-gray-100 rounded-2xl p-3.5 flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#717171]">Source Material</span>
                <div className="max-h-24 overflow-y-auto custom-scrollbar pr-1">
                  <p className="text-xs text-[#717171] italic leading-relaxed whitespace-pre-wrap">
                    {currentCard.selectedText}
                  </p>
                </div>
              </div>
            )}

            <p className="text-[11px] text-[#717171] text-center my-0.5">
              Press <span className="font-semibold text-[#222222]">Enter</span> to save · <span className="font-semibold text-[#222222]">Shift + Enter</span> for new line
            </p>

            {/* Modal Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-1">
              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={isSaving}
                className="text-xs font-bold text-[#222222] underline hover:text-black py-2 px-1 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving || !editQuestion.trim()}
                className="bg-gradient-to-r from-[#FF385C] to-[#E61E4D] hover:opacity-95 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {deleteModal.type === 'all' ? 'Wipe All Flashcards?' : 'Delete Flashcard?'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {deleteModal.type === 'all'
                ? 'Are you sure you want to completely wipe all your flashcards? This cannot be undone.'
                : 'Are you sure you want to delete this flashcard?'}
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteModal({ show: false, type: null }); }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (deleteModal.type === 'all') confirmDeleteAll();
                  else confirmDeleteSingle();
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors shadow-sm shadow-red-200 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Text Modal */}
      {isExpanded && (
        <div className="absolute inset-0 z-50 bg-brand flex flex-col p-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-lg">Full Text</h3>
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white/10 rounded-xl p-4 shadow-inner custom-scrollbar">
            <div className="text-white text-sm font-medium leading-relaxed w-full">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ ...props }) => <table className="w-full border-collapse my-2 text-xs" {...props} />,
                  th: ({ ...props }) => <th className="border border-white/30 bg-black/20 px-2 py-1 text-left font-bold" {...props} />,
                  td: ({ ...props }) => <td className="border border-white/30 px-2 py-1" {...props} />,
                  p: ({ ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                }}
              >
                {currentCard.selectedText}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Brain className="w-5 h-5 text-brand" />
            Active Recall
          </h2>
          {currentCard.sourceUrl && (
            <a
              href={currentCard.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline mt-1 truncate max-w-[200px]"
            >
              Source Article
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium bg-red-50 text-brand px-3 py-1 rounded-full">
            {dueCards.length - currentCardIndex} Due
          </span>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Flashcard"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Flashcard */}
      <div
        className="relative w-full flex-1 cursor-pointer transition-transform duration-500 ease-in-out min-h-0"
        style={{ perspective: '1000px' }}
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        <div
          className="absolute inset-0 w-full h-full rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center p-6 text-center transition-all duration-500"
          style={{
            backfaceVisibility: 'hidden',
            backgroundColor: 'white',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Deck badge — top-left corner */}
          {currentCard.deck && currentCard.deck.toLowerCase() !== 'general' && (
            <span
              className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: `${getDeckColor(currentCard.deck)}18`, color: getDeckColor(currentCard.deck) }}
            >
              <Tag className="w-2.5 h-2.5" />
              {currentCard.deck}
            </span>
          )}
          <div className="flex flex-col items-center max-w-full px-2">
            <div className="flex items-center gap-1.5 mb-4 group/edit">
              <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand">Question</span>
              <button
                onClick={handleOpenEdit}
                className="text-gray-400 hover:text-brand transition-colors cursor-pointer ml-1 p-0.5"
                title="Edit Question"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-lg font-medium text-gray-800 leading-snug break-words">{currentCard.question}</p>
            <span className="absolute bottom-4 text-xs text-gray-400">Click to flip</span>
          </div>
        </div>

        <div
          className="absolute inset-0 w-full h-full rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center p-6 text-center transition-all duration-500"
          style={{
            backfaceVisibility: 'hidden',
            backgroundColor: '#FF5A5F',
            color: 'white',
            transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)'
          }}
        >
          <div className="flex flex-col items-center w-full h-full relative pt-2">
            <span className="text-xs uppercase tracking-widest text-red-200 font-bold mb-3 shrink-0">Answer</span>

            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
              className="absolute top-0 right-0 p-2 text-red-200 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              title="Expand text"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <div className="text-sm font-medium leading-snug w-full text-left bg-white/10 p-4 rounded-xl shadow-inner flex-1 overflow-y-auto custom-scrollbar">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ ...props }) => <table className="w-full border-collapse my-2 text-xs" {...props} />,
                  th: ({ ...props }) => <th className="border border-red-300/30 bg-red-800/20 px-2 py-1 text-left font-bold" {...props} />,
                  td: ({ ...props }) => <td className="border border-red-300/30 px-2 py-1" {...props} />,
                  p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                }}
              >
                {currentCard.selectedText}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Rating Buttons */}
      {isFlipped ? (
        <div className="w-full grid grid-cols-4 gap-2 mt-6 shrink-0 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <button
            onClick={() => handleReview('forgot')}
            className="flex flex-col items-center p-3 rounded-xl bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
          >
            <span className="font-bold text-sm">Forgot</span>
            <span className="text-[10px] text-gray-500 mt-1">{getNextIntervalText('forgot')}</span>
          </button>

          <button
            onClick={() => handleReview('hard')}
            className="flex flex-col items-center p-3 rounded-xl bg-gray-100 hover:bg-orange-100 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <span className="font-bold text-sm">Hard</span>
            <span className="text-[10px] text-gray-500 mt-1">{getNextIntervalText('hard')}</span>
          </button>

          <button
            onClick={() => handleReview('good')}
            className="flex flex-col items-center p-3 rounded-xl bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="font-bold text-sm">Good</span>
            <span className="text-[10px] text-gray-500 mt-1">{getNextIntervalText('good')}</span>
          </button>

          <button
            onClick={() => handleReview('easy')}
            className="flex flex-col items-center p-3 rounded-xl bg-gray-100 hover:bg-green-100 hover:text-green-600 transition-colors cursor-pointer"
          >
            <span className="font-bold text-sm">Easy</span>
            <span className="text-[10px] text-gray-500 mt-1">{getNextIntervalText('easy')}</span>
          </button>
        </div>
      ) : (
        <div className="w-full h-[68px] mt-6 shrink-0"></div>
      )}
    </div>
  );
};

export default Dashboard;

