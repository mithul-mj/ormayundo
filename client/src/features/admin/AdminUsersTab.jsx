import { useState } from 'react';
import {
  Ban,
  Unlock,
  LogOut,
  Flame,
  Brain,
  Zap,
  Edit2,
  Trash2,
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
  PAGINATION,
  UI_TIMERS,
  USER_DEFAULTS,
} from '../../shared/constants';

export default function AdminUsersTab({
  usersData,
  onRefresh,
  onToggleBlock,
  onRevokeSessions,
  onUpdateUserDetails,
  onDeleteUser,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  onPageChange,
}) {
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    email: '',
    role: USER_DEFAULTS.DEFAULT_ROLE,
    customDailyLimit: '',
    currentStreak: USER_DEFAULTS.DEFAULT_STREAK,
    maxStreak: USER_DEFAULTS.DEFAULT_STREAK,
    isBlocked: false,
    blockedReason: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || {
    total: 0,
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.TABLE_LIMIT,
    pages: 1,
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      email: user.email || '',
      role: user.role || USER_DEFAULTS.DEFAULT_ROLE,
      customDailyLimit: user.customDailyLimit ?? '',
      currentStreak: user.currentStreak || USER_DEFAULTS.DEFAULT_STREAK,
      maxStreak: user.maxStreak || USER_DEFAULTS.DEFAULT_STREAK,
      isBlocked: !!user.isBlocked,
      blockedReason: user.blockedReason || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSavingEdit(true);
      await onUpdateUserDetails(editingUser._id, {
        ...editForm,
        customDailyLimit: editForm.customDailyLimit === '' ? null : Number(editForm.customDailyLimit),
        currentStreak: Number(editForm.currentStreak),
        maxStreak: Number(editForm.maxStreak),
      });

      Swal.fire({
        icon: 'success',
        title: 'User Updated',
        text: 'User profile details updated successfully.',
        timer: UI_TIMERS.ALERT_SHORT_MS,
        showConfirmButton: false,
      });
      setEditingUser(null);
      onRefresh();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteUserClick = async (user) => {
    const result = await Swal.fire({
      title: 'Permanently Delete User Account?',
      text: `Are you sure you want to delete ${user.email}? This will delete all their flashcards, decks, and records permanently.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF385C',
      confirmButtonText: 'Yes, permanently delete',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoadingId(user._id);
      await onDeleteUser(user._id);
      Swal.fire({
        icon: 'success',
        title: 'Account Deleted',
        text: `${user.email} and all their records have been removed.`,
        timer: UI_TIMERS.ALERT_MEDIUM_MS,
        showConfirmButton: false,
      });
      onRefresh();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBlockClick = async (user) => {
    const isBlocking = !user.isBlocked;

    if (isBlocking) {
      const { value: reason, isConfirmed } = await Swal.fire({
        title: 'Suspend Student Account',
        text: `Are you sure you want to suspend access for ${user.email}? This will immediately invalidate all active sessions.`,
        input: 'text',
        inputPlaceholder: 'Reason for suspension (optional)',
        showCancelButton: true,
        confirmButtonColor: '#FF385C',
        confirmButtonText: 'Yes, suspend user',
        cancelButtonText: 'Cancel',
      });

      if (!isConfirmed) return;

      try {
        setActionLoadingId(user._id);
        await onToggleBlock(user._id, true, reason);
        Swal.fire({
          icon: 'success',
          title: 'User Suspended',
          text: `${user.email} has been suspended.`,
          timer: UI_TIMERS.ALERT_MEDIUM_MS,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || err.message, 'error');
      } finally {
        setActionLoadingId(null);
      }
    } else {
      const result = await Swal.fire({
        title: 'Restore Student Account',
        text: `Restore full platform access for ${user.email}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Yes, restore access',
        cancelButtonText: 'Cancel',
      });

      if (!result.isConfirmed) return;

      try {
        setActionLoadingId(user._id);
        await onToggleBlock(user._id, false);
        Swal.fire({
          icon: 'success',
          title: 'Access Restored',
          text: `${user.email} access has been restored.`,
          timer: UI_TIMERS.ALERT_MEDIUM_MS,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || err.message, 'error');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleRevokeSessionsClick = async (user) => {
    const result = await Swal.fire({
      title: 'Force Logout / Revoke Sessions?',
      text: `This will disconnect all active devices for ${user.email} and force re-login.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F59E0B',
      confirmButtonText: 'Force Logout',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoadingId(user._id);
      await onRevokeSessions(user._id);
      Swal.fire({
        icon: 'success',
        title: 'Sessions Revoked',
        text: `Active sessions invalidated for ${user.email}.`,
        timer: UI_TIMERS.ALERT_MEDIUM_MS,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs animate-fade-in overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search students by email..."
          className="flex-1 max-w-md"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active Only' },
              { value: 'blocked', label: 'Blocked Only' },
            ]}
            variant="pill"
            size="sm"
          />

          <Select
            value={roleFilter}
            onChange={onRoleFilterChange}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'user', label: 'Students Only' },
              { value: 'admin', label: 'Admins Only' },
            ]}
            variant="pill"
            size="sm"
          />

          <button
            onClick={onRefresh}
            className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-full border border-gray-200 transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Desktop Users Table (hidden on mobile/tablet) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface/80 border-b border-divider text-muted uppercase font-bold text-[10px]">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Daily Quota</th>
              <th className="py-3 px-4">Flashcards</th>
              <th className="py-3 px-4">Streak</th>
              <th className="py-3 px-4">Tokens Used</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider/60">
            {users.map((u) => {
              const isLoading = actionLoadingId === u._id;
              const avatarLetter = (u.email?.[0] || 'U').toUpperCase();

              return (
                <tr key={u._id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center shrink-0">
                        {avatarLetter}
                      </div>
                      <div className="truncate max-w-[200px]">
                        <span className="font-bold text-ink block truncate">{u.email}</span>
                        <span className="text-[10px] text-muted block">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <PillBadge
                      variant={u.role === 'admin' ? 'brand' : 'neutral'}
                      size="xs"
                    >
                      {u.role === 'admin' ? 'Admin' : 'Student'}
                    </PillBadge>
                  </td>

                  <td className="py-3 px-4">
                    <PillBadge
                      variant={u.isBlocked ? 'danger' : 'success'}
                      size="xs"
                      dot
                      pulse={u.isBlocked}
                    >
                      {u.isBlocked ? 'Suspended' : 'Active'}
                    </PillBadge>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-ink">
                      {u.customDailyLimit ? `${u.customDailyLimit}/day` : `Default (${USER_DEFAULTS.DEFAULT_DAILY_LIMIT})`}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-ink">
                      <Brain className="w-3.5 h-3.5 text-brand" />
                      {u.cardsCount ?? u.cardCount ?? 0}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                      <Flame className="w-3.5 h-3.5" />
                      {u.currentStreak ?? 0}d
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-muted text-[11px]">
                      <Zap className="w-3 h-3 text-purple-600" />
                      {(u.tokensUsed ?? u.tokenUsage?.totalTokens ?? 0).toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Edit User"
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        title="Force Logout (Revoke Sessions)"
                        disabled={isLoading}
                        onClick={() => handleRevokeSessionsClick(u)}
                        className="p-1.5 rounded-lg text-muted hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>

                      <button
                        title={u.isBlocked ? 'Restore Access' : 'Suspend Account'}
                        disabled={isLoading}
                        onClick={() => handleBlockClick(u)}
                        className={[
                          'p-1.5 rounded-lg transition-colors cursor-pointer',
                          u.isBlocked
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-muted hover:text-red-600 hover:bg-red-50',
                        ].join(' ')}
                      >
                        {u.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        title="Delete User Permanently"
                        disabled={isLoading}
                        onClick={() => handleDeleteUserClick(u)}
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
        {users.map((u) => {
          const isLoading = actionLoadingId === u._id;
          const avatarLetter = (u.email?.[0] || 'U').toUpperCase();

          return (
            <div key={u._id} className="p-4 space-y-3 hover:bg-surface/30 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center shrink-0">
                    {avatarLetter}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-xs text-ink block truncate">{u.email}</span>
                    <span className="text-[10px] text-muted">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <PillBadge
                    variant={u.role === 'admin' ? 'brand' : 'neutral'}
                    size="xs"
                  >
                    {u.role === 'admin' ? 'Admin' : 'Student'}
                  </PillBadge>
                  <PillBadge
                    variant={u.isBlocked ? 'danger' : 'success'}
                    size="xs"
                    dot
                  >
                    {u.isBlocked ? 'Suspended' : 'Active'}
                  </PillBadge>
                </div>
              </div>

              {/* 3-Col Metric Grid */}
              <div className="grid grid-cols-3 gap-2 py-1.5 text-center text-xs">
                <div>
                  <span className="text-[10px] text-muted block">Cards</span>
                  <span className="font-bold text-ink">{u.cardsCount ?? u.cardCount ?? 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted block">Streak</span>
                  <span className="font-bold text-amber-600">{u.currentStreak ?? 0}d</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted block">Tokens</span>
                  <span className="font-bold text-purple-600">{(u.tokensUsed ?? u.tokenUsage?.totalTokens ?? 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center justify-between pt-1 border-t border-divider/60">
                <span className="text-[11px] text-muted font-medium">
                  Quota: {u.customDailyLimit ? `${u.customDailyLimit}/day` : `${USER_DEFAULTS.DEFAULT_DAILY_LIMIT}/day`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    title="Edit User"
                    onClick={() => openEditModal(u)}
                    className="p-2 rounded-full text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    title="Force Logout"
                    disabled={isLoading}
                    onClick={() => handleRevokeSessionsClick(u)}
                    className="p-2 rounded-full text-muted hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                  <button
                    title={u.isBlocked ? 'Restore Access' : 'Suspend Account'}
                    disabled={isLoading}
                    onClick={() => handleBlockClick(u)}
                    className={[
                      'p-2 rounded-full transition-colors cursor-pointer',
                      u.isBlocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted hover:text-red-600 hover:bg-red-50',
                    ].join(' ')}
                  >
                    {u.isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                  </button>
                  <button
                    title="Delete User"
                    disabled={isLoading}
                    onClick={() => handleDeleteUserClick(u)}
                    className="p-2 rounded-full text-muted hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {users.length === 0 && (
        <div className="p-8 text-center text-xs text-muted">
          No users found matching your search and filter criteria.
        </div>
      )}

      {/* Pagination Bar */}
      <div className="p-4 border-t border-divider flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-muted">
        <span>
          Showing {users.length} of {pagination.total} students
        </span>
        <div className="flex items-center gap-2">
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

      {/* Reusable Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit Student Account"
        subtitle={editingUser?.email}
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="User Role"
              value={editForm.role}
              onChange={(val) => setEditForm({ ...editForm, role: val })}
              options={[
                { value: 'user', label: 'Student (Standard)' },
                { value: 'admin', label: 'Admin (Full Access)' },
              ]}
              variant="rounded"
              className="w-full"
            />

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Custom Daily Limit</label>
              <input
                type="number"
                min="1"
                placeholder={`Default (${USER_DEFAULTS.DEFAULT_DAILY_LIMIT})`}
                value={editForm.customDailyLimit}
                onChange={(e) => setEditForm({ ...editForm, customDailyLimit: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Current Streak</label>
              <input
                type="number"
                min="0"
                value={editForm.currentStreak}
                onChange={(e) => setEditForm({ ...editForm, currentStreak: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Max Streak Record</label>
              <input
                type="number"
                min="0"
                value={editForm.maxStreak}
                onChange={(e) => setEditForm({ ...editForm, maxStreak: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink"
              />
            </div>
          </div>

          {/* Reusable Suspension Toggle */}
          <div className="p-4 rounded-2xl bg-surface border border-divider space-y-3">
            <Toggle
              checked={editForm.isBlocked}
              onChange={(checked) => setEditForm({ ...editForm, isBlocked: checked })}
              label="Suspend Account (Block Access)"
              description="Immediately invalidates active sessions and halts card creation"
              variant="danger"
              size="md"
            />

            {editForm.isBlocked && (
              <input
                type="text"
                placeholder="Reason for suspension (optional)"
                value={editForm.blockedReason}
                onChange={(e) => setEditForm({ ...editForm, blockedReason: e.target.value })}
                className="w-full px-3.5 py-2 bg-white text-ink text-xs rounded-xl border border-red-300 focus:outline-hidden focus:border-red-500 animate-fade-in"
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-divider">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
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
              <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
