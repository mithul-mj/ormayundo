import { useState, useEffect, useMemo } from 'react';
import { Brain } from 'lucide-react';
import Swal from 'sweetalert2';
import { themeColors } from '../../shared/theme';
import {
  useFlashcardsDataQuery,
  useCreateDeckMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useWipeAllCardsMutation,
  useDeleteDeckMutation,
} from './api/flashcardsApi';
import {
  DeckFilterBar,
  NewDeckModal,
  SearchBar,
  FlashcardCard,
  Pagination,
  FlashcardsSkeleton,
} from './components';

const CARDS_PER_PAGE = 5;

const FlashcardManager = ({ onOpenStudySession }) => {
  const [selectedDeck, setSelectedDeck] = useState('All');
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

  // Consolidated query for both flashcards and deck taxonomy
  const { data: flashcardsData, isLoading: dataLoading } = useFlashcardsDataQuery();

  // Robust normalization: handles { cards: [...] }, flat array [...], or nested payload
  const cards = useMemo(() => {
    if (Array.isArray(flashcardsData)) return flashcardsData;
    if (Array.isArray(flashcardsData?.cards)) return flashcardsData.cards;
    if (Array.isArray(flashcardsData?.data)) return flashcardsData.data;
    return [];
  }, [flashcardsData]);

  const decks = useMemo(() => {
    if (Array.isArray(flashcardsData?.decks)) return flashcardsData.decks;
    return [];
  }, [flashcardsData]);

  const createDeckMutation = useCreateDeckMutation({
    onSuccess: (newDeck) => {
      setSelectedDeck(newDeck.name);
      setNewDeckName('');
      setNewDeckColor('#6366f1');
      setShowDeckInput(false);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Deck "${newDeck.name}" created!`,
        showConfirmButton: false,
        timer: 2000,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Failed to create deck',
        text: error.extractedMessage || 'Error creating deck',
      });
    },
  });

  const updateCardMutation = useUpdateCardMutation({
    onSuccess: () => {
      setEditingId(null);
    },
    onError: (error) => {
      console.error('Failed to edit card', error);
    },
  });

  const deleteCardMutation = useDeleteCardMutation({
    onSuccess: () => {
      Swal.fire({
        title: 'Deleted!',
        text: 'Your flashcard has been deleted.',
        icon: 'success',
        confirmButtonColor: themeColors.brand,
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-bold px-6 py-2',
          cancelButton: 'rounded-xl font-bold px-6 py-2',
        },
      });
    },
  });

  const wipeAllMutation = useWipeAllCardsMutation({
    onSuccess: () => {
      Swal.fire({
        title: 'Wiped!',
        text: 'All your flashcards have been deleted.',
        icon: 'success',
        confirmButtonColor: themeColors.brand,
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-bold px-6 py-2',
          cancelButton: 'rounded-xl font-bold px-6 py-2',
        },
      });
    },
  });

  const deleteDeckMutation = useDeleteDeckMutation({
    onSuccess: (deletedDeck) => {
      if (selectedDeck === deletedDeck.name) setSelectedDeck('All');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Deck "${deletedDeck.name}" deleted`,
        showConfirmButton: false,
        timer: 2000,
      });
    },
  });

  const handleCreateDeck = (e) => {
    e.preventDefault();
    if (newDeckName.trim().length < 3) return;
    createDeckMutation.mutate({ name: newDeckName.trim(), color: newDeckColor });
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
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl font-bold px-6 py-2',
        cancelButton: 'rounded-xl font-bold px-6 py-2',
      },
    });

    if (result.isConfirmed) {
      deleteCardMutation.mutate(id);
    }
  };

  const handleDeleteAll = async () => {
    const isFiltered = selectedDeck !== 'All';
    const result = await Swal.fire({
      title: isFiltered ? 'Wipe Entire Flashcard Library?' : 'Wipe All Flashcards?',
      html: isFiltered
        ? `Warning: You are currently viewing deck <b>"${selectedDeck}"</b>, but "Wipe All" will delete <b>ALL ${cards.length} flashcards across all decks</b>. This action is irreversible!`
        : `Are you sure you want to delete all <b>${cards.length} flashcards</b>? This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Yes, wipe everything!',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl font-bold px-6 py-2',
        cancelButton: 'rounded-xl font-bold px-6 py-2',
      },
    });

    if (result.isConfirmed) {
      wipeAllMutation.mutate();
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
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl font-bold px-6 py-2',
        cancelButton: 'rounded-xl font-bold px-6 py-2',
      },
    });

    if (result.isConfirmed) {
      deleteDeckMutation.mutate(deckToDelete);
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

  const saveEdit = (id) => {
    updateCardMutation.mutate({ id, data: editForm });
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

  const isLoading = dataLoading && cards.length === 0;

  const dueCardsCount = cards.filter(
    (c) => !c.nextReviewAt || new Date(c.nextReviewAt) <= new Date()
  ).length;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
        <FlashcardsSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Top Action Bar with Search & Study CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {cards.length > 0 && onOpenStudySession && (
          <button
            type="button"
            onClick={onOpenStudySession}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Brain className="w-4 h-4" />
            <span>
              {dueCardsCount > 0
                ? `Study Due Cards (${dueCardsCount})`
                : `Practice All Cards (${cards.length})`}
            </span>
          </button>
        )}
      </div>

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

      <div className="grid gap-6 min-w-0 max-w-full">
        {filteredCards.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-2.5 px-4">
            <p className="text-neutral-900 font-bold text-base">
              {selectedDeck !== 'All'
                ? `No flashcards in deck "${selectedDeck}"`
                : searchQuery
                ? `No flashcards matching "${searchQuery}"`
                : 'No flashcards created yet'}
            </p>
            <p className="text-neutral-500 text-xs max-w-sm mx-auto">
              {selectedDeck !== 'All'
                ? 'Highlight text on any webpage with the Ormayundo extension to generate questions for this deck.'
                : 'Highlight notes on articles, documentation, or textbooks to automatically create active recall cards.'}
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

        {cards.length > 0 && (
          <div className="pt-8 pb-4 text-center border-t border-gray-100">
            <button
              onClick={handleDeleteAll}
              className="text-xs font-semibold text-neutral-400 hover:text-red-600 transition-colors cursor-pointer py-1.5 px-3 rounded-full hover:bg-red-50"
            >
              Reset / Delete All Flashcards
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardManager;
