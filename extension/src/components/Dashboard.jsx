import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, CheckCircle, Clock, Trash2 } from 'lucide-react';

import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

const Dashboard = ({ user }) => {
  const [dueCards, setDueCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent flipping the card
    const card = dueCards[currentCardIndex];
    if (window.confirm("Are you sure you want to delete this flashcard?")) {
      try {
        await api.delete(`/recall/${card._id}`);
        // Remove from local array without incrementing index (so the next card slides into this index)
        setDueCards((prev) => prev.filter((_, idx) => idx !== currentCardIndex));
        setIsFlipped(false);
      } catch (error) {
        console.error('Failed to delete card:', error);
      }
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
    <div className="p-6 flex flex-col items-center">
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
        className="relative w-full h-64 cursor-pointer transition-transform duration-500 ease-in-out"
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
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-red-200 font-bold mb-4">Answer</span>
            <p className="text-lg font-medium leading-snug">"{currentCard.selectedText}"</p>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Rating Buttons */}
      {isFlipped && (
        <div className="w-full grid grid-cols-4 gap-2 mt-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
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
      )}
    </div>
  );
};

export default Dashboard;
