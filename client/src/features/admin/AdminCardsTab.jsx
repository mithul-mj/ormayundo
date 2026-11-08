import { useState } from 'react';
import {
  Search,
  Filter,
  Brain,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle,
  Clock,
  ExternalLink,
  X,
  Save,
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminCardsTab({
  cardsData,
  onFetchCards,
  onUpdateCard,
  onDeleteCard,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  onPageChange,
}) {
  const [editingCard, setEditingCard] = useState(null);
  const [editFormData, setEditFormData] = useState({
    question: '',
    selectedText: '',
    deck: 'General',
    interval: 0,
    easinessFactor: 2.5,
    isGraduated: false,
    status: 'active',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const cards = cardsData?.cards || [];
  const pagination = cardsData?.pagination || { total: 0, page: 1, limit: 20, pages: 1 };

  const openEditModal = (card) => {
    setEditingCard(card);
    setEditFormData({
      question: card.question || '',
      selectedText: card.selectedText || '',
      deck: card.deck || 'General',
      interval: card.interval || 0,
      easinessFactor: card.easinessFactor || 2.5,
      isGraduated: !!card.isGraduated,
      status: card.status || 'active',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCard) return;

    try {
      setSavingEdit(true);
      await onUpdateCard(editingCard._id, editFormData);
      Swal.fire({
        icon: 'success',
        title: 'Card Updated',
        text: 'Flashcard changes saved successfully.',
        timer: 1500,
        showConfirmButton: false,
      });
      setEditingCard(null);
      onFetchCards();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleArchive = async (card) => {
    const isArchived = card.status === 'archived';
    try {
      await onDeleteCard(card._id, false);
      Swal.fire({
        icon: 'success',
        title: isArchived ? 'Card Restored' : 'Card Archived',
        timer: 1500,
        showConfirmButton: false,
      });
      onFetchCards();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    }
  };

  const handlePermanentDelete = async (card) => {
    const result = await Swal.fire({
      title: 'Permanently Delete Flashcard?',
      text: 'This action cannot be undone. The card and all review history will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, permanently delete',
    });

    if (!result.isConfirmed) return;

    try {
      await onDeleteCard(card._id, true);
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Flashcard removed from database.',
        timer: 1500,
        showConfirmButton: false,
      });
      onFetchCards();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filter Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-divider shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search flashcards by question or highlighted text..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-xl border border-divider text-xs">
            <Filter className="w-3.5 h-3.5 text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-transparent text-ink text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Cards</option>
              <option value="active">Active Only</option>
              <option value="archived">Archived Only</option>
            </select>
          </div>

          <button
            onClick={onFetchCards}
            className="px-3.5 py-1.5 bg-surface hover:bg-divider/60 text-ink text-xs font-semibold rounded-xl border border-divider transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white rounded-2xl border border-divider shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/80 border-b border-divider text-muted uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Question & Highlight</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Deck</th>
                <th className="py-3.5 px-4">SM-2 Spaced Repetition</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/60">
              {cards.length > 0 ? (
                cards.map((card) => (
                  <tr key={card._id} className="hover:bg-surface/50 transition-colors">
                    {/* Question & Highlight snippet */}
                    <td className="py-3.5 px-4 sm:px-6 max-w-sm">
                      <div className="font-bold text-ink mb-0.5 line-clamp-1" title={card.question}>
                        {card.question}
                      </div>
                      <div className="text-[11px] text-muted line-clamp-2" title={card.selectedText}>
                        "{card.selectedText}"
                      </div>
                      {card.sourceUrl && (
                        <a
                          href={card.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-brand hover:underline mt-1"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>Source URL</span>
                        </a>
                      )}
                    </td>

                    {/* User Email */}
                    <td className="py-3.5 px-4 font-medium text-ink max-w-[140px] truncate" title={card.userEmail}>
                      {card.userEmail}
                    </td>

                    {/* Deck */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-surface text-ink text-[11px] font-semibold border border-divider/60">
                        {card.deck}
                      </span>
                    </td>

                    {/* Spaced Repetition Interval & EF */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 font-bold text-ink">
                        <span>{card.interval}d interval</span>
                        <span className="text-[10px] font-normal text-muted">(EF: {card.easinessFactor?.toFixed(2)})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Due: {new Date(card.nextReviewAt).toLocaleDateString()}</span>
                        {card.isGraduated && (
                          <span className="ml-1 text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle className="w-2.5 h-2.5" /> Graduated
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={[
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                          card.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600',
                        ].join(' ')}
                      >
                        {card.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(card)}
                          title="Edit Card Details"
                          className="p-1.5 rounded-lg bg-surface hover:bg-divider/60 text-ink border border-divider transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-brand" />
                        </button>

                        <button
                          onClick={() => handleToggleArchive(card)}
                          title={card.status === 'archived' ? 'Restore card' : 'Archive card'}
                          className="p-1.5 rounded-lg bg-surface hover:bg-divider/60 text-muted hover:text-ink border border-divider transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handlePermanentDelete(card)}
                          title="Delete permanently"
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-muted">
                    No flashcards found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-divider flex items-center justify-between text-xs text-muted">
          <span>
            Showing {cards.length} of {pagination.total} cards
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 rounded-lg border border-divider bg-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-divider/60 cursor-pointer"
            >
              Previous
            </button>
            <span className="font-semibold text-ink">
              Page {currentPage} of {pagination.pages || 1}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= pagination.pages}
              className="px-3 py-1 rounded-lg border border-divider bg-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-divider/60 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Card Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-divider space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-brand" />
                <h3 className="font-bold text-base text-ink">Edit Flashcard</h3>
              </div>
              <button
                onClick={() => setEditingCard(null)}
                className="text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Generated Question</label>
                <input
                  type="text"
                  required
                  value={editFormData.question}
                  onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
                  className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Selected Highlighted Text</label>
                <textarea
                  rows={4}
                  required
                  value={editFormData.selectedText}
                  onChange={(e) => setEditFormData({ ...editFormData, selectedText: e.target.value })}
                  className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Deck Category</label>
                  <input
                    type="text"
                    required
                    value={editFormData.deck}
                    onChange={(e) => setEditFormData({ ...editFormData, deck: e.target.value })}
                    className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Interval (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.interval}
                    onChange={(e) => setEditFormData({ ...editFormData, interval: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Easiness Factor</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.3"
                    max="5.0"
                    value={editFormData.easinessFactor}
                    onChange={(e) => setEditFormData({ ...editFormData, easinessFactor: parseFloat(e.target.value) || 2.5 })}
                    className="w-full px-3 py-1.5 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={editFormData.isGraduated}
                      onChange={(e) => setEditFormData({ ...editFormData, isGraduated: e.target.checked })}
                      className="accent-brand"
                    />
                    <span className="text-xs font-bold text-ink">Graduated</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-4 py-2 rounded-xl border border-divider bg-surface text-ink text-xs font-semibold hover:bg-divider/60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
