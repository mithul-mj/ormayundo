import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Confetti from 'react-confetti';
import {
  X,
  Sparkles,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Brain,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { useFlashcardsDataQuery, useReviewCardMutation, flashcardsApi } from '../api/flashcardsApi';
import { MarkdownRenderer } from '../../../shared/components';

export default function FlashcardStudySession({
  initialDeck = 'All',
  onClose,
  cards: propCards,
  decks: propDecks,
}) {
  const { data: flashcardsData } = useFlashcardsDataQuery();
  const reviewMutation = useReviewCardMutation();

  const cards = useMemo(() => {
    if (propCards && Array.isArray(propCards)) return propCards;
    if (Array.isArray(flashcardsData)) return flashcardsData;
    if (Array.isArray(flashcardsData?.cards)) return flashcardsData.cards;
    if (Array.isArray(flashcardsData?.data)) return flashcardsData.data;
    return [];
  }, [propCards, flashcardsData]);

  const decks = useMemo(() => {
    if (propDecks && Array.isArray(propDecks)) return propDecks;
    if (Array.isArray(flashcardsData?.decks)) return flashcardsData.decks;
    return [];
  }, [propDecks, flashcardsData]);

  const [selectedDeckFilter] = useState(initialDeck);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [practiceAllMode, setPracticeAllMode] = useState(false);

  // Paginated/Batching session queue state
  const [sessionQueue, setSessionQueue] = useState([]);
  const [totalDueCount, setTotalDueCount] = useState(0);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);

  // Filter helper for fallback/practiceAll
  const filterCards = useCallback((cardsList, deckFilter, practiceAll) => {
    const now = new Date();
    let queue = cardsList;
    if (deckFilter && deckFilter !== 'All') {
      queue = queue.filter(
        (c) => (c.deck || 'General').toLowerCase() === deckFilter.toLowerCase()
      );
    }
    if (practiceAll) {
      return queue;
    }
    return queue.filter((c) => {
      if (!c.nextReviewAt) return true;
      return new Date(c.nextReviewAt) <= now;
    });
  }, []);

  // Fetch initial batch (limit: 5) using the unified /recall/due endpoint
  useEffect(() => {
    let ignore = false;
    async function loadDueQueue() {
      setIsLoadingQueue(true);
      try {
        const { cards: dueCards, totalDue } = await flashcardsApi.getDueCards({
          limit: 5,
          deck: selectedDeckFilter
        });
        if (!ignore) {
          setSessionQueue(dueCards);
          setTotalDueCount(totalDue);
        }
      } catch (err) {
        console.error('Failed to load due cards from API, falling back to local cards:', err);
        if (!ignore) {
          const fallback = filterCards(cards, selectedDeckFilter, false);
          setSessionQueue(fallback);
          setTotalDueCount(fallback.length);
        }
      } finally {
        if (!ignore) setIsLoadingQueue(false);
      }
    }
    loadDueQueue();
    return () => {
      ignore = true;
    };
  }, [selectedDeckFilter]);

  const handlePracticeAll = useCallback(() => {
    const allQueue = filterCards(cards, selectedDeckFilter, true);
    setSessionQueue(allQueue);
    setTotalDueCount(allQueue.length);
    setCurrentIndex(0);
    setIsFlipped(false);
    setPracticeAllMode(true);
  }, [cards, selectedDeckFilter, filterCards]);

  const currentCard = sessionQueue[currentIndex] || null;
  const isFinished = !isLoadingQueue && sessionQueue.length > 0 && currentIndex >= sessionQueue.length;
  const isEmpty = !isLoadingQueue && sessionQueue.length === 0 && !isFinished;

  const currentDeckColor = useMemo(() => {
    if (!currentCard) return '#FF385C';
    const found = decks.find(
      (d) => d.name.toLowerCase() === (currentCard.deck || 'General').toLowerCase()
    );
    return found?.color || '#FF385C';
  }, [currentCard, decks]);

  // Interval preview for the current card (supplied directly by backend)
  const intervalPreview = useMemo(() => {
    if (!currentCard?.intervals) {
      return {
        forgot: { text: '<1m' },
        hard: { text: '5m' },
        good: { text: '1d' },
        easy: { text: '4d' }
      };
    }
    return {
      forgot: { text: currentCard.intervals.forgot || '<1m' },
      hard: { text: currentCard.intervals.hard || '5m' },
      good: { text: currentCard.intervals.good || '1d' },
      easy: { text: currentCard.intervals.easy || '4d' }
    };
  }, [currentCard]);

  const handleRating = useCallback(
    (rating) => {
      if (!currentCard) return;
      const cardToReview = currentCard;

      // Immediately reset flip state and advance index for zero-latency UI transition
      setIsFlipped(false);
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setReviewedCount((prev) => prev + 1);

      // Sliding window prefetch: when 2 or fewer cards remain in buffer, fetch next batch
      const remainingInBuffer = sessionQueue.length - nextIndex;
      if (!practiceAllMode && remainingInBuffer <= 2 && sessionQueue.length < totalDueCount) {
        const excludeIds = sessionQueue.map((c) => c._id);
        flashcardsApi
          .getDueCards({
            limit: 5,
            excludeIds,
            deck: selectedDeckFilter
          })
          .then(({ cards: nextBatch, totalDue }) => {
            if (nextBatch && nextBatch.length > 0) {
              setSessionQueue((prev) => [...prev, ...nextBatch]);
              if (typeof totalDue === 'number') {
                setTotalDueCount(totalDue);
              }
            }
          })
          .catch((err) => console.error('Prefetch next due cards error in web app:', err));
      }

      // Submit rating to backend in background without freezing UI
      setIsSubmitting(true);
      reviewMutation.mutate(
        { id: cardToReview._id, rating },
        {
          onError: (err) => {
            console.error('Failed to submit review:', err);
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        }
      );
    },
    [currentCard, currentIndex, sessionQueue, totalDueCount, practiceAllMode, selectedDeckFilter, reviewMutation]
  );

  // Keyboard Navigation: Space = Flip, 1=Forgot, 2=Hard, 3=Good, 4=Easy, Esc = Exit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        onClose?.();
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isFinished && !isEmpty) {
          setIsFlipped((prev) => !prev);
        }
        return;
      }

      if (isFlipped) {
        if (e.key === '1') handleRating('forgot');
        if (e.key === '2') handleRating('hard');
        if (e.key === '3') handleRating('good');
        if (e.key === '4') handleRating('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isFinished, isEmpty, handleRating, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in">
      {/* Top Session Bar */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-brand" />
            <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              Active Recall Session
            </span>
          </div>
          {selectedDeckFilter !== 'All' && (
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 text-white"
              style={{ backgroundColor: `${currentDeckColor}33` }}
            >
              {selectedDeckFilter}
            </span>
          )}
        </div>

        {/* Counter & Close */}
        <div className="flex items-center gap-4">
          {!isFinished && !isEmpty && !isLoadingQueue && (
            <span className="text-xs font-semibold text-neutral-400">
              Card <span className="text-white font-bold">{currentIndex + 1}</span> of{' '}
              <span className="text-white font-bold">{Math.max(totalDueCount, sessionQueue.length)}</span>
            </span>
          )}
          <button
            onClick={onClose}
            title="Exit Session (Esc)"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Flashcard Stage */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div className="max-w-2xl w-full">
          {isLoadingQueue ? (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-12 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px] animate-pulse">
              <Brain className="w-10 h-10 text-brand mb-3 animate-bounce" />
              <p className="text-neutral-400 text-sm font-semibold">Loading due cards...</p>
            </div>
          ) : isFinished ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden animate-scale-up">
              <Confetti
                width={typeof window !== 'undefined' ? window.innerWidth : 600}
                height={typeof window !== 'undefined' ? window.innerHeight : 600}
                recycle={false}
                numberOfPieces={160}
              />
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                Session Complete! 🎉
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto mb-8">
                You reviewed{' '}
                <span className="text-white font-bold">{reviewedCount} cards</span> in this session.
                Your study streak has been extended and future recall intervals updated!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-full bg-brand hover:bg-brand-hover text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={handlePracticeAll}
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white font-semibold text-xs sm:text-sm border border-white/15 transition-all cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Practice All Ahead
                </button>
              </div>
            </div>
          ) : isEmpty ? (
            /* STATE 2: Zero cards due right now */
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/20 text-brand flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                All Caught Up!
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm max-w-sm mx-auto mb-6">
                You have no cards due for spaced review right now. New intervals will unlock as
                time elapses.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-brand hover:bg-brand-hover text-white font-bold text-xs cursor-pointer"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={handlePracticeAll}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 text-xs font-semibold border border-white/10 cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Study All {cards.length} Cards Anyway
                </button>
              </div>
            </div>
          ) : currentCard ? (
            /* STATE 3: Interactive Study Card */
            <div
              key={currentCard._id}
              className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[82vh] min-h-[380px] sm:min-h-[440px] animate-fade-in"
            >
              {/* Card Meta Bar */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-neutral-50/50 shrink-0">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full text-white shadow-2xs"
                  style={{ backgroundColor: currentDeckColor }}
                >
                  {currentCard.deck || 'General'}
                </span>

                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  {currentCard.sourceUrl && (
                    <a
                      href={currentCard.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-neutral-800 transition-colors"
                      title="View source webpage"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Source</span>
                    </a>
                  )}
                  <span>•</span>
                  <span>
                    Interval: {currentCard.interval > 0 ? `${currentCard.interval}d` : 'New'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 flex-1 min-h-0 flex flex-col justify-between space-y-4 overflow-hidden">
                {/* Question Area */}
                <div className="shrink-0 max-h-[24vh] overflow-y-auto custom-scrollbar pr-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand block mb-1.5">
                    Question
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug">
                    {currentCard.question || 'Review this concept:'}
                  </h3>
                </div>

                {/* Answer Area (Revealed on Flip) */}
                {isFlipped ? (
                  <div className="pt-4 border-t border-gray-100 animate-fade-in flex-1 min-h-0 flex flex-col">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 block mb-2 shrink-0">
                      Answer / Explanation
                    </span>
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal custom-scrollbar pr-2.5 max-h-[34vh] sm:max-h-[42vh]">
                      <MarkdownRenderer content={currentCard.selectedText || ''} />
                    </div>
                  </div>
                ) : (
                  <div className="py-8 flex items-center justify-center shrink-0">
                    <button
                      onClick={() => setIsFlipped(true)}
                      className="px-8 py-3.5 rounded-full bg-neutral-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>Show Answer</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Difficulty Rating Bar (Only when flipped) */}
              {isFlipped ? (
                <div className="p-4 sm:p-5 bg-neutral-50 border-t border-gray-100 animate-fade-in shrink-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Forgot Button */}
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleRating('forgot')}
                      className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-300 text-rose-700 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                    >
                      <span className="text-xs font-black">Forgot</span>
                      <span className="text-[11px] text-rose-500 font-mono font-bold">
                        {intervalPreview?.forgot?.text || '<1m'}
                      </span>
                    </button>

                    {/* Hard Button */}
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleRating('hard')}
                      className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-300 text-amber-800 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                    >
                      <span className="text-xs font-black">Hard</span>
                      <span className="text-[11px] text-amber-600 font-mono font-bold">
                        {intervalPreview?.hard?.text || '5m'}
                      </span>
                    </button>

                    {/* Good Button */}
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleRating('good')}
                      className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-blue-700 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                    >
                      <span className="text-xs font-black">Good</span>
                      <span className="text-[11px] text-blue-600 font-mono font-bold">
                        {intervalPreview?.good?.text || '1d'}
                      </span>
                    </button>

                    {/* Easy Button */}
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleRating('easy')}
                      className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 text-emerald-800 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                    >
                      <span className="text-xs font-black">Easy</span>
                      <span className="text-[11px] text-emerald-600 font-mono font-bold">
                        {intervalPreview?.easy?.text || '4d'}
                      </span>
                    </button>
                  </div>
                  <div className="text-center mt-2.5">
                    <span className="text-[10px] text-neutral-400">
                      Keys: <kbd className="px-1 py-0.5 bg-white border rounded">1</kbd> Forgot &bull;{' '}
                      <kbd className="px-1 py-0.5 bg-white border rounded">2</kbd> Hard &bull;{' '}
                      <kbd className="px-1 py-0.5 bg-white border rounded">3</kbd> Good &bull;{' '}
                      <kbd className="px-1 py-0.5 bg-white border rounded">4</kbd> Easy
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-2.5 text-center bg-neutral-50/50 border-t border-gray-100">
                  <span className="text-[11px] text-neutral-400">
                    Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">Space</kbd> to reveal answer
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-12 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px]">
              <Brain className="w-10 h-10 text-brand mb-3 animate-pulse" />
              <p className="text-neutral-400 text-sm font-semibold">Preparing your study card...</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Session Progress Indicator */}
      <div className="max-w-3xl w-full mx-auto py-2">
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-brand h-full transition-all duration-300"
            style={{
              width: `${
                sessionQueue.length > 0
                  ? Math.min(100, Math.round((currentIndex / Math.max(totalDueCount, sessionQueue.length)) * 100))
                  : 0
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
