import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, X, Save, Search, RefreshCw, ChevronLeft, ChevronRight, Bomb, FolderPlus, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Swal from 'sweetalert2';
import { API_URL } from './config';
import { themeColors } from './theme';

const FlashcardManager = () => {
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState('All');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ question: '', selectedText: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckColor, setNewDeckColor] = useState('#6366f1');
  const [showDeckInput, setShowDeckInput] = useState(false);
  const [openDeckDropdown, setOpenDeckDropdown] = useState(null); // card._id

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 5;

  // Reset to first page when searching or changing deck
  useEffect(() => {
    const timer = setTimeout(() => setCurrentPage(1), 0);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedDeck]);

  useEffect(() => {
    let ignore = false;
    async function startFetching() {
      try {
        const [decksRes, cardsRes] = await Promise.all([
          axios.get(`${API_URL}/decks`, { withCredentials: true }),
          axios.get(`${API_URL}/recall`, { withCredentials: true })
        ]);
        if (!ignore) {
          setDecks(decksRes.data);
          setCards(cardsRes.data);
        }
      } catch (error) {
        console.error('Failed to load initial data', error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    startFetching();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (newDeckName.trim().length < 3) return;

    try {
      const res = await axios.post(`${API_URL}/decks`, { name: newDeckName.trim(), color: newDeckColor }, { withCredentials: true });
      setDecks([...decks, res.data]);
      setSelectedDeck(res.data.name);
      setNewDeckName('');
      setNewDeckColor('#6366f1');
      setShowDeckInput(false);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Deck "${res.data.name}" created!`,
        showConfirmButton: false,
        timer: 2000
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to create deck',
        text: error.response?.data?.message || 'Error creating deck'
      });
    }
  };
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this flashcard?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: themeColors.brand,
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
        confirmButtonColor: themeColors.brand,
        customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold px-6 py-2' }
      });
    } catch (error) {
      console.error('Failed to delete card', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete flashcard.',
        icon: 'error',
        confirmButtonColor: themeColors.brand,
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
      confirmButtonColor: themeColors.brand,
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
        confirmButtonColor: themeColors.brand,
        customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold px-6 py-2' }
      });
    } catch (error) {
      console.error('Failed to wipe cards', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete all flashcards.',
        icon: 'error',
        confirmButtonColor: themeColors.brand,
        customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold px-6 py-2' }
      });
    }
  };

  const handleDeleteDeck = async (deckToDelete) => {
    if (!deckToDelete || deckToDelete.name.toLowerCase() === 'general') return;

    const result = await Swal.fire({
      title: `Delete Deck "${deckToDelete.name}"?`,
      text: "Cards in this deck will be moved to 'General'.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: themeColors.brand,
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Yes, delete deck',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl font-bold px-6 py-2',
        cancelButton: 'rounded-xl font-bold px-6 py-2'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/decks/${deckToDelete._id}`, { withCredentials: true });
      setDecks(decks.filter(d => d._id !== deckToDelete._id));
      if (selectedDeck === deckToDelete.name) setSelectedDeck('All');
      // Reassign local cards to General
      setCards(cards.map(c => (c.deck === deckToDelete.name ? { ...c, deck: 'General' } : c)));
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Deck "${deckToDelete.name}" deleted`,
        showConfirmButton: false,
        timer: 2000
      });
    } catch (error) {
      console.error('Failed to delete deck', error);
    }
  };

  const startEditing = (card) => {
    setEditingId(card._id);
    setEditForm({
      question: card.question || '',
      selectedText: card.selectedText || '',
      deck: card.deck || 'General'
    });
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
    const matchesSearch = (c.question || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.selectedText || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDeck = selectedDeck === 'All' || (c.deck || 'General') === selectedDeck;
    return matchesSearch && matchesDeck;
  });

  // Pagination Logic
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  const getDeckColor = (deckName) => {
    const found = decks.find(d => d.name.toLowerCase() === (deckName || 'general').toLowerCase());
    return found?.color || '#FF9532';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Flashcards</h1>
          <p className="text-gray-500 mt-1">View, filter by deck, edit, or delete your knowledge base.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-light"
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

      {/* --- DECKS FILTER BAR --- */}
      <div className="flex flex-wrap items-center gap-2 pt-2 pb-1 border-b border-gray-100">
        <button
          onClick={() => setSelectedDeck('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${selectedDeck === 'All'
            ? 'bg-gray-900 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          All Decks ({cards.length})
        </button>

        {decks.map(deck => {
          const count = cards.filter(c => (c.deck || 'General') === deck.name).length;
          const isGeneral = deck.name.toLowerCase() === 'general';
          return (
            <div key={deck._id || deck.name} className="group relative flex items-center">
              <button
                onClick={() => setSelectedDeck(deck.name)}
                style={{
                  backgroundColor: selectedDeck === deck.name ? deck.color : `${deck.color}18`,
                  color: selectedDeck === deck.name ? '#FFFFFF' : deck.color
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm ${!isGeneral ? 'pr-8' : ''}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedDeck === deck.name ? '#FFFFFF' : deck.color }}></span>
                {deck.name} ({count})
              </button>
              {!isGeneral && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteDeck(deck); }}
                  title={`Delete deck "${deck.name}"`}
                  className="absolute right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/10"
                  style={{ color: selectedDeck === deck.name ? '#FFFFFF' : deck.color }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={() => setShowDeckInput(true)}
          className="px-3 py-1.5 border border-dashed border-gray-300 hover:border-brand-light hover:text-brand-light text-gray-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <FolderPlus className="w-3.5 h-3.5" /> New Deck
        </button>

        {/* New Deck Modal */}
        {showDeckInput && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
            onClick={() => { setShowDeckInput(false); setNewDeckName(''); }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-5"
              style={{ animation: 'deckModalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-brand-light/10">
                    <FolderPlus className="w-4 h-4 text-brand-light" />
                  </div>
                  <h2 className="text-sm font-bold text-gray-800">Create New Deck</h2>
                </div>
                <button
                  onClick={() => { setShowDeckInput(false); setNewDeckName(''); }}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDeck} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Deck Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Biology, History..."
                    value={newDeckName}
                    onChange={e => setNewDeckName(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && (setShowDeckInput(false), setNewDeckName(''))}
                    autoFocus
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-light/30 focus:border-brand-light transition-all"
                  />
                  {newDeckName.length > 0 && newDeckName.trim().length < 3 && (
                    <p className="text-[11px] text-amber-500 font-semibold mt-1.5 ml-1">
                      {3 - newDeckName.trim().length} more character{3 - newDeckName.trim().length !== 1 ? 's' : ''} needed
                    </p>
                  )}
                  {/* Colour dots — no label, just pick */}
                  <div className="flex items-center gap-2 mt-2.5">
                    {['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#f97316'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewDeckColor(c)}
                        className="w-5 h-5 rounded-full transition-all duration-150"
                        style={{
                          backgroundColor: c,
                          transform: newDeckColor === c ? 'scale(1.35)' : 'scale(1)',
                          boxShadow: newDeckColor === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowDeckInput(false); setNewDeckName(''); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={newDeckName.trim().length < 3}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-light hover:bg-brand transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Create Deck
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><RefreshCw className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid gap-6">
          {filteredCards.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <p className="text-gray-500 font-medium">No flashcards found in this deck.</p>
            </div>
          )}
          {currentCards.map((card) => (
            <div key={card._id} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-5">

                {/* Question Section & Deck Badge */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-brand flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand"></div> Question
                    </h3>

                    {editingId === card._id ? (
                      <div className="relative flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Deck</span>
                        <button
                          type="button"
                          onClick={() => setOpenDeckDropdown(openDeckDropdown === card._id ? null : card._id)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all"
                          style={{
                            backgroundColor: `${getDeckColor(editForm.deck || 'General')}15`,
                            color: getDeckColor(editForm.deck || 'General'),
                            borderColor: `${getDeckColor(editForm.deck || 'General')}40`
                          }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getDeckColor(editForm.deck || 'General') }} />
                          {editForm.deck || 'General'}
                          <svg className="w-3 h-3 ml-0.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {openDeckDropdown === card._id && (
                          <div className="absolute top-full right-0 mt-1 z-20 bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 min-w-[140px] flex flex-col gap-0.5">
                            {decks.map(d => (
                              <button
                                key={d._id || d.name}
                                type="button"
                                onClick={() => { setEditForm({ ...editForm, deck: d.name }); setOpenDeckDropdown(null); }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold w-full text-left transition-colors hover:bg-gray-50"
                                style={{ color: d.color || '#FF9532' }}
                              >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color || '#FF9532' }} />
                                {d.name}
                                {(editForm.deck || 'General') === d.name && (
                                  <svg className="w-3.5 h-3.5 ml-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span
                        style={{ backgroundColor: `${getDeckColor(card.deck)}18`, color: getDeckColor(card.deck) }}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" /> {card.deck || 'General'}
                      </span>
                    )}
                  </div>
                  {editingId === card._id ? (
                    <input
                      type="text"
                      value={editForm.question}
                      onChange={e => setEditForm({ ...editForm, question: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl text-lg font-bold shadow-inner focus:ring-2 focus:ring-brand-light/20 focus:border-brand-light focus:outline-none transition-all"
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
                      className="w-full p-4 border border-gray-200 rounded-xl font-mono text-sm text-gray-700 bg-gray-50/50 shadow-inner focus:ring-2 focus:ring-brand-light/20 focus:border-brand-light focus:outline-none transition-all"
                    />
                  ) : (
                    <div className="p-5 bg-gray-50/50 border border-gray-100 rounded-2xl shadow-sm max-h-72 overflow-y-auto custom-scrollbar">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ ...props }) => <table className="markdown-table" {...props} />,
                          a: ({ ...props }) => <a className="text-brand-light font-medium hover:underline hover:text-brand transition-colors" {...props} />,
                          p: ({ ...props }) => <p className="text-gray-700 leading-relaxed mb-4 last:mb-0" {...props} />
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
                  {card.sourceUrl && <a href={card.sourceUrl} target="_blank" rel="noreferrer" className="text-brand-light hover:underline">Source Link</a>}
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
                className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 bg-white shadow-sm border border-gray-100 hover:shadow-md hover:text-brand-light hover:-translate-x-0.5'}`}
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
                className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 bg-white shadow-sm border border-gray-100 hover:shadow-md hover:text-brand-light hover:translate-x-0.5'}`}
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
