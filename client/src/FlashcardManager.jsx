import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, X, Save, Search, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
    if (!window.confirm("Are you sure you want to delete this flashcard?")) return;
    try {
      await axios.delete(`${API_URL}/recall/${id}`, { withCredentials: true });
      setCards(cards.filter(c => c._id !== id));
    } catch (error) {
      console.error('Failed to delete card', error);
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
        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search cards..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
            <div key={card._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">

                {/* Question Section */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-gray-400 mb-1">Question</h3>
                  {editingId === card._id ? (
                    <input
                      type="text"
                      value={editForm.question}
                      onChange={e => setEditForm({ ...editForm, question: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg text-lg font-bold"
                    />
                  ) : (
                    <p className="text-lg font-bold text-gray-900">{card.question}</p>
                  )}
                </div>

                {/* Answer Section */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-gray-400 mb-1">Answer (Source Text)</h3>
                  {editingId === card._id ? (
                    <textarea
                      value={editForm.selectedText}
                      onChange={e => setEditForm({ ...editForm, selectedText: e.target.value })}
                      rows={6}
                      className="w-full p-4 border border-gray-200 rounded-lg font-mono text-sm text-gray-700 bg-gray-50 focus:ring-2 focus:ring-[#FF5A5F] focus:outline-none"
                    />
                  ) : (
                    <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm max-h-72 overflow-y-auto">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ node, ...props }) => <table className="markdown-table" {...props} />,
                          a: ({ node, ...props }) => <a className="text-[#FF5A5F] hover:underline" {...props} />
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
                    <button onClick={() => saveEdit(card._id)} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition"><Save className="w-5 h-5" /></button>
                    <button onClick={() => setEditingId(null)} className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(card)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"><Pencil className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(card._id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"><Trash2 className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${currentPage === 1 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-[#FF5A5F] text-white hover:bg-[#FF385C]'}`}
              >
                Previous
              </button>

              <span className="text-gray-500 font-medium text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${currentPage === totalPages ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-[#FF5A5F] text-white hover:bg-[#FF385C]'}`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardManager;
