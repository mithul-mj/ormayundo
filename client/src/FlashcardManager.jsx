import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, X, Save, Search, RefreshCw, ChevronLeft, ChevronRight, Bomb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Swal from 'sweetalert2';
import { API_URL } from './config';

const FlashcardManager = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ question: '', selectedText: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 5;

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/recall`, { withCredentials: true });
      setCards(res.data);
    } catch (error) {
      console.error('Failed to fetch cards', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this flashcard?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF5A5F',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl font-bold px-6 py-2',
        cancelButton: 'rounded-xl font-bold px-6 py-2'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/recall/${id}`, { withCredentials: true });
      setCards(cards.filter(c => c._id !== id));
      Swal.fire({
        title: 'Deleted!',
        text: 'Your flashcard has been deleted.',
        icon: 'success',
        confirmButtonColor: '#FF5A5F',
        customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold px-6 py-2' }
      });
    } catch (error) {
      console.error('Failed to delete card', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete flashcard.',
        icon: 'error',
        confirmButtonColor: '#FF5A5F',
        customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold px-6 py-2' }
      });
    }
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: 'Wipe All Flashcards?',
      text: "Are you sure you want to delete EVERY flashcard? This cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF5A5F',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Yes, wipe them all!',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl font-bold px-6 py-2',
        cancelButton: 'rounded-xl font-bold px-6 py-2'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/recall/all`, { withCredentials: true });
      setCards([]);
      Swal.fire({
        title: 'Wiped!',
        text: 'All your flashcards have been deleted.',
        icon: 'success',
        confirmButtonColor: '#FF5A5F',
        customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold px-6 py-2' }
      });
    } catch (error) {
      console.error('Failed to wipe cards', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete all flashcards.',
        icon: 'error',
        confirmButtonColor: '#FF5A5F',
        customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold px-6 py-2' }
      });
    }
  };

  const startEditing = (card) => {
    setEditingId(card._id);
    setEditForm({ question: card.question, selectedText: card.selectedText });
  };

  const saveEdit = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/recall/${id}`, editForm, { withCredentials: true });
      setCards(cards.map(c => c._id === id ? res.data : c));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to edit card', error);
    }
  };

  const filteredCards = cards.filter(c => {
    const question = c.question || '';
    const text = c.selectedText || '';
    return question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination Logic
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Flashcards</h1>
          <p className="text-gray-500 mt-1">View, edit, or delete your entire knowledge base.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={handleDeleteAll}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors w-full sm:w-auto shadow-sm"
          >
            <Bomb className="w-4 h-4" /> Wipe All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><RefreshCw className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid gap-6">
          {filteredCards.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <p className="text-gray-500">No flashcards found.</p>
            </div>
          )}
          {currentCards.map((card) => (
            <div key={card._id} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-5">

                {/* Question Section */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-brand mb-1.5 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand"></div> Question
                  </h3>
                  {editingId === card._id ? (
                    <input
                      type="text"
                      value={editForm.question}
                      onChange={e => setEditForm({ ...editForm, question: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl text-lg font-bold shadow-inner focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F] focus:outline-none transition-all"
                    />
                  ) : (
                    <p className="text-xl font-bold text-gray-900 leading-tight">{card.question}</p>
                  )}
                </div>

                {/* Answer Section */}
                <div>

                  {editingId === card._id ? (
                    <textarea
                      value={editForm.selectedText}
                      onChange={e => setEditForm({ ...editForm, selectedText: e.target.value })}
                      rows={6}
                      className="w-full p-4 border border-gray-200 rounded-xl font-mono text-sm text-gray-700 bg-gray-50/50 shadow-inner focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F] focus:outline-none transition-all"
                    />
                  ) : (
                    <div className="p-5 bg-gray-50/50 border border-gray-100 rounded-2xl shadow-sm max-h-72 overflow-y-auto custom-scrollbar">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ node, ...props }) => <table className="markdown-table" {...props} />,
                          a: ({ node, ...props }) => <a className="text-[#FF5A5F] font-medium hover:underline hover:text-[#FF385C] transition-colors" {...props} />,
                          p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-4 last:mb-0" {...props} />
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
                  {card.sourceUrl && <a href={card.sourceUrl} target="_blank" rel="noreferrer" className="text-[#FF5A5F] hover:underline">Source Link</a>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 shrink-0">
                {editingId === card._id ? (
                  <>
                    <button onClick={() => saveEdit(card._id)} className="p-2 text-gray-400 hover:text-green-600 transition-colors"><Save className="w-5 h-5" /></button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors"><X className="w-5 h-5" /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(card)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Pencil className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(card._id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-8 mb-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 bg-white shadow-sm border border-gray-100 hover:shadow-md hover:text-[#FF5A5F] hover:-translate-x-0.5'}`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-400">Page</span>
                <span className="w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-full font-bold text-sm shadow-md">
                  {currentPage}
                </span>
                <span className="text-sm font-semibold text-gray-400">of {totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 bg-white shadow-sm border border-gray-100 hover:shadow-md hover:text-[#FF5A5F] hover:translate-x-0.5'}`}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardManager;
