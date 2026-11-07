import { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_URL } from '../../shared/config';
import { themeColors } from '../../shared/theme';
import {
  DeckFilterBar,
  NewDeckModal,
  SearchBar,
  FlashcardCard,
  Pagination,
} from './components';

const CARDS_PER_PAGE = 5;

const FlashcardManager = () => {
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState('All');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ question: '', selectedText: '', deck: 'General' });
  const [searchQuery, setSearchQuery] = useState('');
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckColor, setNewDeckColor] = useState('#6366f1');
  const [showDeckInput, setShowDeckInput] = useState(false);
  const [openDeckDropdown, setOpenDeckDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when searching or changing deck
  useEffect(() => {
    const timer = setTimeout(() => setCurrentPage(1), 0);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedDeck]);

  // Initial data load
  useEffect(() => {
    let ignore = false;
    async function startFetching() {
      try {
        const [decksRes, cardsRes] = await Promise.all([
          axios.get(`${API_URL}/decks`, { withCredentials: true }),
          axios.get(`${API_URL}/recall`, { withCredentials: true }),
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
      const res = await axios.post(
        `${API_URL}/decks`,
        { name: newDeckName.trim(), color: newDeckColor },
        { withCredentials: true }
      );
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
        timer: 2000,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to create deck',
        text: error.response?.data?.message || 'Error creating deck',
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
        cancelButton: 'rounded-xl font-bold px-6 py-2',
      },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/recall/${id}`, { withCredentials: true });
      setCards(cards.filter((c) => c._id !== id));
      Swal.fire({
        title: 'Deleted!',
        text: 'Your flashcard has been deleted.',
        icon: 'success',
        confirmButtonColor: themeColors.brand,
        customClass: {
          popup: 'rounded-3xl',
          confirmButton: 'rounded-xl font-bold px-6 py-2',
        },
      });
    } catch (error) {
      console.error('Failed to delete card', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete flashcard.',
        icon: 'error',
        confirmButtonColor: themeColors.brand,
        customClass: {
          popup: 'rounded-3xl',
          confirmButton: 'rounded-xl font-bold px-6 py-2',
        },
      });
    }
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: 'Wipe All Flashcards?',
      text: 'Are you sure you want to delete EVERY flashcard? This cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: themeColors.brand,
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Yes, wipe them all!',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl font-bold px-6 py-2',
        cancelButton: 'rounded-xl font-bold px-6 py-2',
      },
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
        customClass: {
          popup: 'rounded-3xl',
          confirmButton: 'rounded-xl font-bold px-6 py-2',
        },
      });
    } catch (error) {
      console.error('Failed to wipe cards', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete all flashcards.',
        icon: 'error',
        confirmButtonColor: themeColors.brand,
        customClass: {
          popup: 'rounded-3xl',
          confirmButton: 'rounded-xl font-bold px-6 py-2',
        },
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
        cancelButton: 'rounded-xl font-bold px-6 py-2',
      },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/decks/${deckToDelete._id}`, {
        withCredentials: true,
      });
      setDecks(decks.filter((d) => d._id !== deckToDelete._id));
      if (selectedDeck === deckToDelete.name) setSelectedDeck('All');
      setCards(
        cards.map((c) =>
          c.deck === deckToDelete.name ? { ...c, deck: 'General' } : c
        )
      );
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Deck "${deckToDelete.name}" deleted`,
        showConfirmButton: false,
        timer: 2000,
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
      deck: card.deck || 'General',
    });
  };

  const saveEdit = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/recall/${id}`, editForm, {
        withCredentials: true,
      });
      setCards(cards.map((c) => (c._id === id ? res.data : c)));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to edit card', error);
    }
  };

  const filteredCards = cards.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (c.question || '').toLowerCase().includes(query) ||
      (c.selectedText || '').toLowerCase().includes(query);
    const matchesDeck =
      selectedDeck === 'All' || (c.deck || 'General') === selectedDeck;
    return matchesSearch && matchesDeck;
  });

  const indexOfLastCard = currentPage * CARDS_PER_PAGE;
  const indexOfFirstCard = indexOfLastCard - CARDS_PER_PAGE;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE);

  const getDeckColor = (deckName) => {
    const found = decks.find(
      (d) => d.name.toLowerCase() === (deckName || 'general').toLowerCase()
    );
    return found?.color || '#FF9532';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onWipeAll={handleDeleteAll}
      />

      <DeckFilterBar
        cards={cards}
        decks={decks}
        selectedDeck={selectedDeck}
        onSelectDeck={setSelectedDeck}
        onOpenNewDeckModal={() => setShowDeckInput(true)}
        onDeleteDeck={handleDeleteDeck}
      />

      <NewDeckModal
        isOpen={showDeckInput}
        newDeckName={newDeckName}
        newDeckColor={newDeckColor}
        onNameChange={setNewDeckName}
        onColorChange={setNewDeckColor}
        onCreate={handleCreateDeck}
        onClose={() => {
          setShowDeckInput(false);
          setNewDeckName('');
        }}
      />

      {loading ? (
        <div className="flex justify-center p-20">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCards.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <p className="text-gray-500 font-medium">
                No flashcards found in this deck.
              </p>
            </div>
          )}

          {currentCards.map((card) => (
            <FlashcardCard
              key={card._id}
              card={card}
              decks={decks}
              isEditing={editingId === card._id}
              editForm={editForm}
              openDeckDropdown={openDeckDropdown}
              onStartEditing={startEditing}
              onCancelEditing={() => setEditingId(null)}
              onSaveEdit={saveEdit}
              onDelete={handleDelete}
              onEditFormChange={setEditForm}
              onToggleDeckDropdown={(id) =>
                setOpenDeckDropdown(openDeckDropdown === id ? null : id)
              }
              getDeckColor={getDeckColor}
            />
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default FlashcardManager;

