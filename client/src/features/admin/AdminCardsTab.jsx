import { useState } from 'react';
import {
  Edit2,
  Archive,
  RotateCcw,
  Trash2,
  ExternalLink,
  Layers,
  Save,
} from 'lucide-react';
import Swal from 'sweetalert2';
import {
  Toggle,
  Select,
  Modal,
  PillBadge,
  SearchInput,
} from '../../shared/components';
import {
  SPACED_REPETITION,
  UI_TIMERS,
  PAGINATION,
} from '../../shared/constants';

const getSourceDomain = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./i, '') || url;
  } catch {
    return 'Source';
  }
};

export default function AdminCardsTab({
  cards: directCards,
  cardsData,
  pagination: directPagination,
  onFetchCards,
  onUpdateCard,
  onDeleteCard,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onPageChange,
}) {
  const cards = directCards || cardsData?.cards || [];
  const pagination = directPagination || cardsData?.pagination || {
    total: cards.length,
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.TABLE_LIMIT,
    pages: 1,
  };

  const [editingCard, setEditingCard] = useState(null);
  const [editFormData, setEditFormData] = useState({
    question: '',
    selectedText: '',
    deck: 'General',
    status: 'active',
    interval: SPACED_REPETITION.DEFAULT_INTERVAL,
    easinessFactor: SPACED_REPETITION.DEFAULT_EASINESS_FACTOR,
    isGraduated: false,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const openEditModal = (card) => {
    setEditingCard(card);
    setEditFormData({
      question: card.question || '',
      selectedText: card.selectedText || '',
      deck: card.deck || 'General',
      status: card.status || 'active',
      interval: card.interval || SPACED_REPETITION.DEFAULT_INTERVAL,
      easinessFactor: card.easinessFactor || SPACED_REPETITION.DEFAULT_EASINESS_FACTOR,
      isGraduated: !!card.isGraduated,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCard) return;

    try {
      setSavingEdit(true);
      await onUpdateCard(editingCard._id, {
        ...editFormData,
        interval: Number(editFormData.interval),
        easinessFactor: Number(editFormData.easinessFactor),
      });

      Swal.fire({
        icon: 'success',
        title: 'Flashcard Updated',
        text: 'Flashcard and spaced repetition intervals updated.',
        timer: UI_TIMERS.ALERT_SHORT_MS,
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

  const handleDeleteCard = async (card) => {
    const result = await Swal.fire({
      title: 'Permanently Delete Flashcard?',
      text: 'This card and its review intervals will be completely erased from the student database.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF385C',
      confirmButtonText: 'Yes, permanently delete',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await onDeleteCard(card._id);
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Flashcard permanently deleted.',
        timer: UI_TIMERS.ALERT_SHORT_MS,
        showConfirmButton: false,
      });
      onFetchCards();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleToggleArchive = async (card) => {
    const newStatus = card.status === 'archived' ? 'active' : 'archived';
    try {
      await onUpdateCard(card._id, { status: newStatus });
      Swal.fire({
        icon: 'success',
        title: newStatus === 'archived' ? 'Card Archived' : 'Card Restored',
        timer: UI_TIMERS.ALERT_SHORT_MS,
        showConfirmButton: false,
      });
      onFetchCards();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Search & Filter Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search flashcards by question or text..."
          className="flex-1 max-w-md"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active Only' },
              { value: 'archived', label: 'Archived Only' },
            ]}
            variant="pill"
            size="sm"
          />

          <button
            onClick={onFetchCards}
            className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-full border border-gray-200 transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Desktop Table View (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-gray-200/70 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Question & Highlight</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Deck</th>
                <th className="py-3.5 px-4">Spaced Repetition</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/60">
              {cards.map((card) => {
                const userEmail = card.userId?.email || 'Unknown User';
                const isArchived = card.status === 'archived';

                return (
                  <tr key={card._id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 px-6 max-w-md">
                      <div className="space-y-1">
                        <span className="font-extrabold text-ink text-xs block line-clamp-2">
                          {card.question}
                        </span>
                        <p className="text-[11px] text-muted line-clamp-1 italic">
                          &ldquo;{card.selectedText}&rdquo;
                        </p>
                        {card.sourceUrl && (
                          <a
                            href={card.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-brand hover:underline font-semibold"
                          >
                            <span>{getSourceDomain(card.sourceUrl)}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-ink font-semibold max-w-[140px] truncate" title={userEmail}>
                        {userEmail}
                      </div>
                      <span className="text-[10px] text-muted block">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <PillBadge variant="neutral" size="xs">
                        <Layers className="w-3 h-3 text-muted" />
                        {card.deck || 'General'}
                      </PillBadge>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        <span className="text-ink font-bold block">
                          Interval: {card.interval || 0}d
                        </span>
                        <span className="text-muted block text-[10px]">
                          EF: {card.easinessFactor ? card.easinessFactor.toFixed(SPACED_REPETITION.EF_DISPLAY_DECIMALS) : SPACED_REPETITION.DEFAULT_EASINESS_FACTOR.toFixed(SPACED_REPETITION.EF_DISPLAY_DECIMALS)}
                        </span>
                        {card.isGraduated && (
                          <PillBadge variant="success" size="xs">
                            Graduated
                          </PillBadge>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <PillBadge
                        variant={isArchived ? 'warning' : 'success'}
                        size="xs"
                        dot
                      >
                        {isArchived ? 'Archived' : 'Active'}
                      </PillBadge>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Edit Card"
                          onClick={() => openEditModal(card)}
                          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          title={isArchived ? 'Restore Card' : 'Archive Card'}
                          onClick={() => handleToggleArchive(card)}
                          className={[
                            'p-1.5 rounded-lg transition-colors cursor-pointer',
                            isArchived
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-muted hover:text-amber-600 hover:bg-amber-50',
                          ].join(' ')}
                        >
                          {isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          title="Delete Card Permanently"
                          onClick={() => handleDeleteCard(card)}
                          className="p-1.5 rounded-lg text-muted hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View (< 768px) */}
        <div className="md:hidden divide-y divide-divider/60">
          {cards.map((card) => {
            const userEmail = card.userId?.email || 'Unknown User';
            const isArchived = card.status === 'archived';

            return (
              <div key={card._id} className="p-4 space-y-3 hover:bg-surface/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-extrabold text-ink text-xs leading-snug line-clamp-2 flex-1">
                    {card.question}
                  </span>
                  <PillBadge
                    variant={isArchived ? 'warning' : 'success'}
                    size="xs"
                    dot
                  >
                    {isArchived ? 'Archived' : 'Active'}
                  </PillBadge>
                </div>

                <p className="text-[11px] text-muted italic line-clamp-2 pl-3 border-l-2 border-brand/40">
                  &ldquo;{card.selectedText}&rdquo;
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <PillBadge variant="neutral" size="xs">
                      {card.deck || 'General'}
                    </PillBadge>
                    <span className="text-[11px] text-muted font-medium">
                      Interval: {card.interval || 0}d
                    </span>
                  </div>
                  <span className="text-[11px] text-muted truncate max-w-[130px]" title={userEmail}>
                    {userEmail}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-divider/60">
                  {card.sourceUrl ? (
                    <a
                      href={card.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-brand hover:underline font-semibold"
                    >
                      <span>{getSourceDomain(card.sourceUrl)}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : <span />}

                  <div className="flex items-center gap-1">
                    <button
                      title="Edit Card"
                      onClick={() => openEditModal(card)}
                      className="p-1.5 rounded-full text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      title={isArchived ? 'Restore Card' : 'Archive Card'}
                      onClick={() => handleToggleArchive(card)}
                      className={[
                        'p-1.5 rounded-full transition-colors cursor-pointer',
                        isArchived ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted hover:text-amber-600 hover:bg-amber-50',
                      ].join(' ')}
                    >
                      {isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </button>
                    <button
                      title="Delete Card"
                      onClick={() => handleDeleteCard(card)}
                      className="p-1.5 rounded-full text-muted hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {cards.length === 0 && (
          <div className="p-8 text-center text-xs text-muted">
            No flashcards found matching your query.
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-divider flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-muted">
          <span>
            Showing {cards.length} of {pagination.total} total flashcards
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3.5 py-1.5 rounded-full border border-divider hover:border-ink disabled:opacity-40 disabled:hover:border-divider cursor-pointer font-semibold transition-colors"
            >
              Previous
            </button>
            <span className="font-bold text-ink">
              {pagination.page} / {pagination.pages || 1}
            </span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3.5 py-1.5 rounded-full border border-divider hover:border-ink disabled:opacity-40 disabled:hover:border-divider cursor-pointer font-semibold transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Reusable Edit Card Modal */}
      <Modal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        title="Edit Flashcard Record"
        subtitle="Update question text, deck categorization, or spaced repetition intervals"
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Generated Question</label>
            <input
              type="text"
              required
              value={editFormData.question}
              onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Selected Highlighted Text</label>
            <textarea
              rows={4}
              required
              value={editFormData.selectedText}
              onChange={(e) => setEditFormData({ ...editFormData, selectedText: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink focus:bg-white resize-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Deck Name</label>
              <input
                type="text"
                required
                value={editFormData.deck}
                onChange={(e) => setEditFormData({ ...editFormData, deck: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink"
              />
            </div>

            <Select
              label="Card Status"
              value={editFormData.status}
              onChange={(val) => setEditFormData({ ...editFormData, status: val })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'archived', label: 'Archived' },
              ]}
              variant="rounded"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Interval (Days)</label>
              <input
                type="number"
                min={SPACED_REPETITION.MIN_INTERVAL}
                value={editFormData.interval}
                onChange={(e) => setEditFormData({ ...editFormData, interval: parseInt(e.target.value) || SPACED_REPETITION.MIN_INTERVAL })}
                className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Easiness Factor (EF)</label>
              <input
                type="number"
                step={SPACED_REPETITION.EASINESS_FACTOR_STEP}
                min={SPACED_REPETITION.MIN_EASINESS_FACTOR}
                max={SPACED_REPETITION.MAX_EASINESS_FACTOR}
                value={editFormData.easinessFactor}
                onChange={(e) => setEditFormData({ ...editFormData, easinessFactor: parseFloat(e.target.value) || SPACED_REPETITION.DEFAULT_EASINESS_FACTOR })}
                className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-divider">
            <Toggle
              checked={editFormData.isGraduated}
              onChange={(checked) => setEditFormData({ ...editFormData, isGraduated: checked })}
              label={`Mark as Graduated (>${SPACED_REPETITION.GRADUATED_THRESHOLD_DAYS} Days Interval)`}
              description="Student has permanently committed this memory to long-term storage"
              variant="success"
              size="md"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-divider">
            <button
              type="button"
              onClick={() => setEditingCard(null)}
              className="px-5 py-2.5 rounded-full border border-divider bg-surface text-ink text-xs font-bold hover:bg-surface-hover cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand text-white text-xs font-bold hover:bg-brand-hover transition-colors cursor-pointer shadow-sm shadow-brand/20 disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingEdit ? 'Saving...' : 'Save Card Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
