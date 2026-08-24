import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, Clock, Trash2, Bomb, Maximize2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api';

const Dashboard = ({ user }) => {
  const [dueCards, setDueCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null }); // 'single' | 'all'

  useEffect(() => {
    fetchDueCards();
  }, []);

  const fetchDueCards = async () => {
    try {
      const { data } = await api.get('/recall/due');
      setDueCards(data);
    } catch (error) {
      console.error('Failed to fetch due cards:', error);
    } finally {
      setLoading(false);
    }
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
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };



  if (loading) {
    return <div className="p-8 text-center text-gray-500">Checking your memory bank...</div>;
  }

  // If all caught up
  if (currentCardIndex >= dueCards.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">You're all caught up!</h2>
        <p className="text-gray-500 mt-2 text-sm">No flashcards due right now. Go highlight some text to learn more!</p>
      </div>
    );
  }

  const currentCard = dueCards[currentCardIndex];

  return (
    <div className="relative p-6 flex flex-col items-center h-full w-full overflow-hidden">
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
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (deleteModal.type === 'all') confirmDeleteAll();
                  else confirmDeleteSingle();
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors shadow-sm shadow-red-200"
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
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white/10 rounded-xl p-4 shadow-inner custom-scrollbar">
            <div className="text-white text-sm font-medium leading-relaxed w-full">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ node, ...props }) => <table className="w-full border-collapse my-2 text-xs" {...props} />,
                  th: ({ node, ...props }) => <th className="border border-white/30 bg-black/20 px-2 py-1 text-left font-bold" {...props} />,
                  td: ({ node, ...props }) => <td className="border border-white/30 px-2 py-1" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
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
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Question</span>
            <p className="text-lg font-medium text-gray-800 leading-snug">{currentCard.question}</p>
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
              className="absolute top-0 right-0 p-2 text-red-200 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Expand text"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <div className="text-sm font-medium leading-snug w-full text-left bg-white/10 p-4 rounded-xl shadow-inner flex-1 overflow-y-auto custom-scrollbar">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ node, ...props }) => <table className="w-full border-collapse my-2 text-xs" {...props} />,
                  th: ({ node, ...props }) => <th className="border border-red-300/30 bg-red-800/20 px-2 py-1 text-left font-bold" {...props} />,
                  td: ({ node, ...props }) => <td className="border border-red-300/30 px-2 py-1" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
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
            className="flex flex-col items-center p-3 rounded-xl bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            <span className="font-bold text-sm">Forgot</span>
            <span className="text-[10px] text-gray-500 mt-1">1 min</span>
          </button>

          <button
            onClick={() => handleReview('hard')}
            className="flex flex-col items-center p-3 rounded-xl bg-gray-100 hover:bg-orange-100 hover:text-orange-600 transition-colors"
          >
            <span className="font-bold text-sm">Hard</span>
            <span className="text-[10px] text-gray-500 mt-1">3 mins</span>
          </button>

          <button
            onClick={() => handleReview('good')}
            className="flex flex-col items-center p-3 rounded-xl bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors"
          >
            <span className="font-bold text-sm">Good</span>
            <span className="text-[10px] text-gray-500 mt-1">5 mins</span>
          </button>

          <button
            onClick={() => handleReview('easy')}
            className="flex flex-col items-center p-3 rounded-xl bg-gray-100 hover:bg-green-100 hover:text-green-600 transition-colors"
          >
            <span className="font-bold text-sm">Easy</span>
            <span className="text-[10px] text-gray-500 mt-1">10 mins</span>
          </button>
        </div>
      ) : (
        <div className="w-full h-[68px] mt-6 shrink-0"></div>
      )}
    </div>
  );
};

export default Dashboard;
