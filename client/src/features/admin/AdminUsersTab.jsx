import { useState } from 'react';
import {
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Unlock,
  LogOut,
  Smartphone,
  Flame,
  Brain,
  Zap,
  Edit2,
  Trash2,
  X,
  Save,
} from 'lucide-react';
import Swal from 'sweetalert2';

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
  currentPage,
  onPageChange,
}) {
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    email: '',
    role: 'user',
    customDailyLimit: '',
    currentStreak: 0,
    maxStreak: 0,
    isBlocked: false,
    blockedReason: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || { total: 0, page: 1, limit: 20, pages: 1 };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      email: user.email || '',
      role: user.role || 'user',
      customDailyLimit: user.customDailyLimit ?? '',
      currentStreak: user.currentStreak || 0,
      maxStreak: user.maxStreak || 0,
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
        timer: 1500,
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
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, permanently delete',
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoadingId(user._id);
      await onDeleteUser(user._id);
      Swal.fire({
        icon: 'success',
        title: 'Account Deleted',
        text: `${user.email} and all their records have been removed.`,
        timer: 2000,
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
        title: 'Block User Account',
        text: `Are you sure you want to suspend access for ${user.email}? This will invalidate all active sessions.`,
        input: 'text',
        inputPlaceholder: 'Reason for suspension (optional)',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Yes, block user',
        cancelButtonText: 'Cancel',
      });

      if (!isConfirmed) return;

      try {
        setActionLoadingId(user._id);
        await onToggleBlock(user._id, true, reason);
        Swal.fire({
          icon: 'success',
          title: 'User Blocked',
          text: `${user.email} has been suspended.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || err.message, 'error');
      } finally {
        setActionLoadingId(null);
      }
    } else {
      const result = await Swal.fire({
        title: 'Unblock User Account',
        text: `Restore full platform access for ${user.email}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Yes, unblock',
      });

      if (!result.isConfirmed) return;

      try {
        setActionLoadingId(user._id);
        await onToggleBlock(user._id, false);
        Swal.fire({
          icon: 'success',
          title: 'User Unblocked',
          text: `${user.email} access has been restored.`,
          timer: 2000,
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
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoadingId(user._id);
      await onRevokeSessions(user._id);
      Swal.fire({
        icon: 'success',
        title: 'Sessions Revoked',
        text: `Active sessions invalidated for ${user.email}.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-divider shadow-xs overflow-hidden animate-fade-in">
      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-6 border-b border-divider flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-xl border border-divider text-xs">
            <Filter className="w-3.5 h-3.5 text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-transparent text-ink text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-xl border border-divider text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-muted" />
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="bg-transparent text-ink text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="user">Users Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            className="px-3 py-1.5 bg-surface hover:bg-divider/60 text-ink text-xs font-semibold rounded-xl border border-divider transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface/80 border-b border-divider text-muted uppercase font-bold tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">User / Email</th>
              <th className="py-3.5 px-4">Status & Quota</th>
              <th className="py-3.5 px-4">Activity & Streak</th>
              <th className="py-3.5 px-4">Flashcards</th>
              <th className="py-3.5 px-4">Tokens Used</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider/60">
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user._id}
                  className={[
                    'hover:bg-surface/50 transition-colors',
                    user.isBlocked ? 'bg-red-50/20' : '',
                  ].join(' ')}
                >
                  {/* User Email & Role */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center shrink-0 text-xs">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-ink flex items-center gap-1.5">
                          <span>{user.email}</span>
                          {user.role === 'admin' ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold tracking-wide">
                              ADMIN
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[11px] text-muted block">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status & Daily Quota */}
                  <td className="py-3.5 px-4">
                    {user.isBlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-[11px]">
                        <ShieldAlert className="w-3 h-3" />
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px]">
                        <ShieldCheck className="w-3 h-3" />
                        Active
                      </span>
                    )}
                    <span className="text-[10px] text-muted block mt-1">
                      Daily Limit: {user.customDailyLimit ? `${user.customDailyLimit}/day (Custom)` : 'Default (30/day)'}
                    </span>
                  </td>

                  {/* Activity & Streak */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-ink">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>{user.currentStreak || 0} days</span>
                      <span className="text-muted text-[10px] font-normal">(best: {user.maxStreak || 0})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
                      <Smartphone className="w-3 h-3" />
                      <span>{user.fcmDevicesCount || 0} push devices</span>
                    </div>
                  </td>

                  {/* Cards Count */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-semibold text-ink">
                      <Brain className="w-3.5 h-3.5 text-brand" />
                      <span>{user.cardsCount || 0} cards</span>
                    </div>
                    <span className="text-[11px] text-muted block">
                      {user.decksCount || 0} decks
                    </span>
                  </td>

                  {/* Tokens Used */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-ink">
                      <Zap className="w-3.5 h-3.5 text-purple-600" />
                      <span>{(user.tokensUsed || 0).toLocaleString()}</span>
                    </div>
                    <span className="text-[11px] text-muted block">
                      ${(user.estimatedCost || 0).toFixed(4)} est. cost
                    </span>
                  </td>

                  {/* Action Controls */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit User Button */}
                      <button
                        onClick={() => openEditModal(user)}
                        title="Edit User Profile & Quotas"
                        className="p-1.5 rounded-lg bg-surface hover:bg-divider/60 text-ink border border-divider transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-brand" />
                      </button>

                      {/* Block / Unblock Button */}
                      <button
                        onClick={() => handleBlockClick(user)}
                        disabled={actionLoadingId === user._id}
                        title={user.isBlocked ? 'Unblock user' : 'Suspend user'}
                        className={[
                          'p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer',
                          user.isBlocked
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
                        ].join(' ')}
                      >
                        {user.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      </button>

                      {/* Force Logout Button */}
                      <button
                        onClick={() => handleRevokeSessionsClick(user)}
                        disabled={actionLoadingId === user._id}
                        title="Force logout (revoke sessions)"
                        className="p-1.5 rounded-lg bg-surface hover:bg-divider/60 text-amber-600 border border-divider transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete User Button */}
                      <button
                        onClick={() => handleDeleteUserClick(user)}
                        disabled={actionLoadingId === user._id}
                        title="Permanently delete user"
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
                  No users found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-divider flex items-center justify-between text-xs text-muted">
        <span>
          Showing {users.length} of {pagination.total} users
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-divider space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="font-bold text-base text-ink">Edit User Profile & Settings</h3>
              <button onClick={() => setEditingUser(null)} className="text-muted hover:text-ink cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">User Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand cursor-pointer"
                  >
                    <option value="user">User (Standard)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Custom Daily Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Default (30)"
                    value={editForm.customDailyLimit}
                    onChange={(e) => setEditForm({ ...editForm, customDailyLimit: e.target.value })}
                    className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Current Streak (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.currentStreak}
                    onChange={(e) => setEditForm({ ...editForm, currentStreak: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Max Streak Record</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.maxStreak}
                    onChange={(e) => setEditForm({ ...editForm, maxStreak: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Suspension status toggle */}
              <div className="p-3 rounded-xl bg-surface border border-divider space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isBlocked}
                    onChange={(e) => setEditForm({ ...editForm, isBlocked: e.target.checked })}
                    className="accent-red-500"
                  />
                  <span className="text-xs font-bold text-red-600">Suspend Account (Block Access)</span>
                </label>

                {editForm.isBlocked && (
                  <input
                    type="text"
                    placeholder="Reason for suspension (optional)"
                    value={editForm.blockedReason}
                    onChange={(e) => setEditForm({ ...editForm, blockedReason: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white text-ink text-xs rounded-lg border border-divider focus:outline-none focus:border-red-400"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
                  <span>{savingEdit ? 'Saving...' : 'Save User Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
