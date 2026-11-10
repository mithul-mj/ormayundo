import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Brain,
  Zap,
  Sliders,
  Server,
  RefreshCw,
  AlertOctagon,
  LogOut,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { API_URL } from '../../shared/config';
import AdminOverviewTab from './AdminOverviewTab';
import AdminUsersTab from './AdminUsersTab';
import AdminCardsTab from './AdminCardsTab';
import AdminTokensTab from './AdminTokensTab';
import AdminGuardrailsTab from './AdminGuardrailsTab';
import AdminSystemTab from './AdminSystemTab';
import AdminLogin from './AdminLogin';
import { Skeleton } from '../../shared/components';
import { ADMIN_TABS, USER_ROLES, PAGINATION } from '../../shared/constants';

export default function AdminPortal({
  user: initialUser = null,
  onLoginSuccess,
  onLogout,
  onNavigateHome,
}) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [verifyingAuth, setVerifyingAuth] = useState(!initialUser);
  const [activeTab, setActiveTab] = useState(ADMIN_TABS.OVERVIEW);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [stats, setStats] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [cardsData, setCardsData] = useState(null);
  const [config, setConfig] = useState(null);
  const [tokenAnalytics, setTokenAnalytics] = useState(null);
  const [incidents, setIncidents] = useState([]);

  // User table query states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(PAGINATION.DEFAULT_PAGE);

  // Flashcards query states
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [cardStatusFilter, setCardStatusFilter] = useState('all');
  const [cardCurrentPage, setCardCurrentPage] = useState(PAGINATION.DEFAULT_PAGE);

  // In-flight request guards to guarantee zero duplicate network calls
  const isFetchingOverview = useRef(false);
  const isFetchingTokens = useRef(false);
  const isFetchingConfig = useRef(false);
  const isFetchingUsers = useRef(false);
  const isFetchingCards = useRef(false);
  const isFetchingIncidents = useRef(false);

  // Fetch overview stats (consolidated 1-call fetch)
  const fetchOverview = useCallback(async () => {
    if (isFetchingOverview.current) return;
    isFetchingOverview.current = true;
    try {
      const res = await axios.get(`${API_URL}/admin/stats`, { withCredentials: true });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      isFetchingOverview.current = false;
    }
  }, []);

  // Fetch token usage analytics
  const fetchTokens = useCallback(async () => {
    if (isFetchingTokens.current) return;
    isFetchingTokens.current = true;
    try {
      const res = await axios.get(`${API_URL}/admin/tokens`, { withCredentials: true });
      setTokenAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load token analytics:', err);
    } finally {
      isFetchingTokens.current = false;
    }
  }, []);

  // Fetch platform guardrails & configuration
  const fetchConfig = useCallback(async () => {
    if (isFetchingConfig.current) return;
    isFetchingConfig.current = true;
    try {
      const res = await axios.get(`${API_URL}/admin/config`, { withCredentials: true });
      setConfig(res.data);
    } catch (err) {
      console.error('Failed to load system config:', err);
    } finally {
      isFetchingConfig.current = false;
    }
  }, []);

  // Fetch paginated user list
  const fetchUsers = useCallback(async () => {
    if (isFetchingUsers.current) return;
    isFetchingUsers.current = true;
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: PAGINATION.DEFAULT_LIMIT.toString(),
        status: statusFilter,
        role: roleFilter,
      });
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await axios.get(`${API_URL}/admin/users?${params.toString()}`, {
        withCredentials: true,
      });
      setUsersData(res.data);
    } catch (err) {
      console.error('Failed to load user directory:', err);
    } finally {
      isFetchingUsers.current = false;
    }
  }, [currentPage, statusFilter, roleFilter, searchQuery]);

  // Fetch global flashcards
  const fetchCards = useCallback(async () => {
    if (isFetchingCards.current) return;
    isFetchingCards.current = true;
    try {
      const params = new URLSearchParams({
        page: cardCurrentPage.toString(),
        limit: PAGINATION.DEFAULT_LIMIT.toString(),
        status: cardStatusFilter,
      });
      if (cardSearchQuery.trim()) {
        params.append('search', cardSearchQuery.trim());
      }

      const res = await axios.get(`${API_URL}/admin/flashcards?${params.toString()}`, {
        withCredentials: true,
      });
      setCardsData(res.data);
    } catch (err) {
      console.error('Failed to load flashcards:', err);
    } finally {
      isFetchingCards.current = false;
    }
  }, [cardCurrentPage, cardStatusFilter, cardSearchQuery]);

  // Fetch failure incidents and alerts
  const fetchIncidents = useCallback(async () => {
    if (isFetchingIncidents.current) return;
    isFetchingIncidents.current = true;
    try {
      const res = await axios.get(`${API_URL}/admin/incidents`, { withCredentials: true });
      setIncidents(res.data);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      isFetchingIncidents.current = false;
    }
  }, []);

  // Targeted reload helper for refresh button (only reloads current tab)
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === ADMIN_TABS.OVERVIEW) {
        await fetchOverview();
      } else if (activeTab === ADMIN_TABS.USERS) {
        await fetchUsers();
      } else if (activeTab === ADMIN_TABS.CARDS) {
        await fetchCards();
      } else if (activeTab === ADMIN_TABS.GUARDRAILS) {
        await fetchConfig();
      } else if (activeTab === ADMIN_TABS.TOKENS) {
        await fetchTokens();
      } else if (activeTab === ADMIN_TABS.SYSTEM) {
        await Promise.all([fetchOverview(), fetchIncidents()]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Access denied or failed to load administrative data.'
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, fetchOverview, fetchTokens, fetchConfig, fetchUsers, fetchCards, fetchIncidents]);

  // Verify administrator session if initialUser is missing or not admin
  useEffect(() => {
    let ignore = false;
    async function checkAdminAuth() {
      if (initialUser) {
        if (initialUser.role === USER_ROLES.ADMIN) {
          setCurrentUser(initialUser);
        } else {
          setCurrentUser(null);
        }
        setVerifyingAuth(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
        if (!ignore) {
          if (res.data?.role === USER_ROLES.ADMIN) {
            setCurrentUser(res.data);
          } else {
            setCurrentUser(null);
          }
        }
      } catch {
        if (!ignore) {
          setCurrentUser(null);
        }
      } finally {
        if (!ignore) {
          setVerifyingAuth(false);
        }
      }
    }

    checkAdminAuth();
    return () => {
      ignore = true;
    };
  }, [initialUser]);

  const isInitialUsersMount = useRef(true);
  const isInitialCardsMount = useRef(true);

  // Lazy tab-driven data loading (only request data needed for the active tab)
  useEffect(() => {
    if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) return;
    let ignore = false;

    async function loadTab() {
      if (activeTab === ADMIN_TABS.OVERVIEW && !stats) {
        await fetchOverview();
      } else if (activeTab === ADMIN_TABS.USERS && !usersData) {
        await fetchUsers();
      } else if (activeTab === ADMIN_TABS.CARDS && !cardsData) {
        await fetchCards();
      } else if (activeTab === ADMIN_TABS.GUARDRAILS && !config) {
        await fetchConfig();
      } else if (activeTab === ADMIN_TABS.TOKENS && !tokenAnalytics) {
        await fetchTokens();
      } else if (activeTab === ADMIN_TABS.SYSTEM) {
        if (!stats) await fetchOverview();
        if (incidents.length === 0) await fetchIncidents();
      }
      if (ignore) return;
    }

    loadTab();
    return () => {
      ignore = true;
    };
  }, [
    activeTab,
    currentUser,
    stats,
    usersData,
    cardsData,
    config,
    tokenAnalytics,
    incidents.length,
    fetchOverview,
    fetchTokens,
    fetchUsers,
    fetchCards,
    fetchConfig,
    fetchIncidents,
  ]);

  // Update user list when filters change (ONLY if on users tab and not on initial mount)
  useEffect(() => {
    if (isInitialUsersMount.current) {
      isInitialUsersMount.current = false;
      return;
    }
    if (activeTab === ADMIN_TABS.USERS) {
      const timer = setTimeout(() => {
        fetchUsers();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentPage, statusFilter, roleFilter, searchQuery, activeTab, fetchUsers]);

  // Update cards list when filters change (ONLY if on cards tab and not on initial mount)
  useEffect(() => {
    if (isInitialCardsMount.current) {
      isInitialCardsMount.current = false;
      return;
    }
    if (activeTab === ADMIN_TABS.CARDS) {
      const timer = setTimeout(() => {
        fetchCards();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [cardCurrentPage, cardStatusFilter, cardSearchQuery, activeTab, fetchCards]);

  // Handlers for user moderation & editing
  const handleToggleBlock = async (userId, isBlocked, reason) => {
    await axios.patch(
      `${API_URL}/admin/users/${userId}/block`,
      { isBlocked, reason },
      { withCredentials: true }
    );
    await Promise.all([fetchUsers(), fetchOverview()]);
  };

  const handleUpdateUserDetails = async (userId, data) => {
    await axios.patch(`${API_URL}/admin/users/${userId}`, data, {
      withCredentials: true,
    });
    await fetchUsers();
  };

  const handleDeleteUser = async (userId) => {
    await axios.delete(`${API_URL}/admin/users/${userId}`, {
      withCredentials: true,
    });
    await Promise.all([fetchUsers(), fetchOverview()]);
  };

  const handleRevokeSessions = async (userId) => {
    await axios.post(
      `${API_URL}/admin/users/${userId}/revoke-sessions`,
      {},
      { withCredentials: true }
    );
  };

  // Handlers for Guardrails & Configuration
  const handleUpdateConfig = async (newConfig) => {
    const res = await axios.put(`${API_URL}/admin/config`, newConfig, {
      withCredentials: true,
    });
    setConfig(res.data.config);
  };

  // Handlers for Flashcards
  const handleUpdateCard = async (cardId, data) => {
    await axios.patch(`${API_URL}/admin/flashcards/${cardId}`, data, {
      withCredentials: true,
    });
  };

  const handleDeleteCard = async (cardId, permanent) => {
    await axios.delete(
      `${API_URL}/admin/flashcards/${cardId}${permanent ? '?permanent=true' : ''}`,
      { withCredentials: true }
    );
  };

  const handleRetryFailedJobs = async () => {
    return axios.post(
      `${API_URL}/admin/queue/retry-failed`,
      {},
      { withCredentials: true }
    );
  };

  const handleBroadcastNotification = async (payload) => {
    return axios.post(`${API_URL}/admin/broadcast`, payload, {
      withCredentials: true,
    });
  };

  const handleResolveIncident = async (incidentId) => {
    await axios.patch(
      `${API_URL}/admin/incidents/${incidentId}/resolve`,
      {},
      { withCredentials: true }
    );
    await Promise.all([fetchIncidents(), fetchOverview()]);
  };

  const handleAdminLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      setStats(null);
      if (onLogout) onLogout();
    }
  };

  if (verifyingAuth) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-ink">
        <Loader2 className="w-8 h-8 text-brand animate-spin mb-3" />
        <span className="text-xs font-semibold text-muted">
          Checking administrator authorization...
        </span>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) {
    return (
      <AdminLogin
        onLoginSuccess={(adminData) => {
          setCurrentUser(adminData);
          if (onLoginSuccess) onLoginSuccess(adminData);
        }}
        onBack={onNavigateHome}
      />
    );
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-ink flex flex-col font-sans">
        <header className="bg-white border-b border-divider h-16 flex items-center px-4 sm:px-8 justify-between">
          <div className="flex items-center gap-3">
            <Skeleton variant="rounded" className="h-9 w-9" />
            <Skeleton variant="rounded" className="h-6 w-28 hidden sm:block" />
            <Skeleton variant="pill" className="h-6 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="pill" className="h-8 w-20" />
            <Skeleton variant="circular" className="h-8 w-8" />
          </div>
        </header>

        <div className="border-b border-divider bg-white px-4 sm:px-8 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="pill" className="h-8 w-24 shrink-0" />
          ))}
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
          <div className="space-y-2">
            <Skeleton variant="rounded" className="h-7 w-64" />
            <Skeleton variant="rounded" className="h-4 w-96 max-w-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-divider shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton variant="rounded" className="h-3.5 w-24" />
                  <Skeleton variant="rounded" className="h-9 w-9" />
                </div>
                <Skeleton variant="rounded" className="h-8 w-20" />
                <Skeleton variant="rounded" className="h-3 w-32" />
              </div>
            ))}
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-divider shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-divider">
              <Skeleton variant="rounded" className="h-5 w-48" />
              <Skeleton variant="pill" className="h-8 w-44" />
            </div>
            <Skeleton variant="rounded" className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-divider shadow-md text-center">
          <AlertOctagon className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink mb-2">Administrator Access Required</h2>
          <p className="text-xs text-muted mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={loadAllData}
              className="px-5 py-2.5 rounded-full bg-brand text-white font-bold text-xs hover:bg-brand-hover transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
            <button
              onClick={() => setCurrentUser(null)}
              className="px-5 py-2.5 rounded-full bg-surface hover:bg-surface-hover text-ink font-bold text-xs border border-divider transition-colors cursor-pointer"
            >
              Re-authenticate
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-ink flex flex-col font-sans">
      {/* Airbnb Signature Sticky Navigation Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-divider sticky top-0 z-50">
        {/* Row 1: Brand & Control Capsule */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex items-center gap-2 cursor-pointer group shrink-0"
              onClick={onNavigateHome}
              title="Return to Student Application"
            >
              <Brain className="w-5 h-5 text-brand transition-transform group-hover:scale-105" />
              <span className="font-extrabold text-xl tracking-tight text-ink hidden min-[400px]:inline">
                Ormayundo<span className="text-brand">.</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-divider text-ink text-[11px] font-bold tracking-wide shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-brand" />
              <span>Admin</span>
            </span>
          </div>

          {/* Center: System Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-divider text-xs font-semibold text-ink">
            <span
              className={[
                'w-2 h-2 rounded-full',
                stats?.incidents?.unresolved > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500',
              ].join(' ')}
            />
            <span>{stats?.incidents?.unresolved > 0 ? `${stats.incidents.unresolved} Active Incident${stats.incidents.unresolved > 1 ? 's' : ''}` : 'Systems Operating'}</span>
          </div>

          {/* Right Action Capsule */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-surface border border-divider hover:border-ink/30 text-ink font-semibold text-xs transition-all shadow-xs cursor-pointer"
              title="Refresh all administrative metrics"
            >
              <RefreshCw className={['w-3.5 h-3.5 text-muted', loading ? 'animate-spin text-brand' : ''].join(' ')} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-surface border border-divider hover:border-ink/30 text-ink font-semibold text-xs transition-all shadow-xs cursor-pointer"
                title="Return to Student Application"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-muted" />
                <span>Student App</span>
              </button>
            )}

            {/* Profile & Logout Capsule */}
            <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-divider">
              <div
                className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0"
                title={currentUser?.email || 'Admin'}
              >
                {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
              </div>

              <span className="hidden xl:inline text-xs font-semibold text-ink max-w-[130px] truncate">
                {currentUser?.email}
              </span>

              <button
                onClick={handleAdminLogout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Sign Out of Admin Console"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Unified Minimal Category Tabs Bar */}
        <div className="border-t border-divider/60 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab(ADMIN_TABS.OVERVIEW)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs transition-all cursor-pointer shrink-0',
                activeTab === ADMIN_TABS.OVERVIEW
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
              ].join(' ')}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab(ADMIN_TABS.USERS)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs transition-all cursor-pointer shrink-0',
                activeTab === ADMIN_TABS.USERS
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
              ].join(' ')}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users</span>
              {stats?.users?.total !== undefined && (
                <span
                  className={[
                    'ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                    activeTab === ADMIN_TABS.USERS ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-800',
                  ].join(' ')}
                >
                  {stats.users.total}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab(ADMIN_TABS.CARDS)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs transition-all cursor-pointer shrink-0',
                activeTab === ADMIN_TABS.CARDS
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
              ].join(' ')}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </button>

            <button
              onClick={() => setActiveTab(ADMIN_TABS.GUARDRAILS)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs transition-all cursor-pointer shrink-0',
                activeTab === ADMIN_TABS.GUARDRAILS
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
              ].join(' ')}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Guardrails</span>
            </button>

            <button
              onClick={() => setActiveTab(ADMIN_TABS.TOKENS)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs transition-all cursor-pointer shrink-0',
                activeTab === ADMIN_TABS.TOKENS
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
              ].join(' ')}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Tokens &amp; Cost</span>
            </button>

            <button
              onClick={() => setActiveTab(ADMIN_TABS.SYSTEM)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs transition-all cursor-pointer shrink-0',
                activeTab === ADMIN_TABS.SYSTEM
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
              ].join(' ')}
            >
              <Server className="w-3.5 h-3.5" />
              <span>System Health</span>
              {stats?.incidents?.unresolved > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                  {stats.incidents.unresolved}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full min-w-0 flex-1 space-y-6">
        {/* Subtle Breadcrumb / Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              {activeTab === ADMIN_TABS.OVERVIEW && 'System Overview & Analytics'}
              {activeTab === ADMIN_TABS.USERS && 'Student Accounts & Quotas'}
              {activeTab === ADMIN_TABS.CARDS && 'Global Flashcard Repository'}
              {activeTab === ADMIN_TABS.GUARDRAILS && 'Platform Guardrails & AI Config'}
              {activeTab === ADMIN_TABS.TOKENS && 'AI Token Accounting & Cloud Cost'}
              {activeTab === ADMIN_TABS.SYSTEM && 'System Health & Worker Queues'}
            </h1>
            <p className="text-xs text-muted mt-0.5">
              {activeTab === ADMIN_TABS.OVERVIEW && 'Real-time platform activity, card retention rates, and cloud resource metrics.'}
              {activeTab === ADMIN_TABS.USERS && 'Manage student accounts, suspend access, revoke active sessions, and set daily limits.'}
              {activeTab === ADMIN_TABS.CARDS && 'Search, moderate, archive, and edit flashcard review intervals across all decks.'}
              {activeTab === ADMIN_TABS.GUARDRAILS && 'Adjust Groq LLM routing, generation temperature, daily caps, and platform maintenance.'}
              {activeTab === ADMIN_TABS.TOKENS && 'Detailed token burn rate, prompt/completion breakdown, and incurred Groq API expenses.'}
              {activeTab === ADMIN_TABS.SYSTEM && 'BullMQ worker queue status, push notifications broadcast, and runtime memory diagnostics.'}
            </p>
          </div>
        </div>

        {/* Tab Views */}
        <div>
          {activeTab === ADMIN_TABS.OVERVIEW && (
            <AdminOverviewTab stats={stats} tokenAnalytics={tokenAnalytics} />
          )}

          {activeTab === ADMIN_TABS.USERS && (
            <AdminUsersTab
              usersData={usersData}
              onRefresh={fetchUsers}
              onToggleBlock={handleToggleBlock}
              onRevokeSessions={handleRevokeSessions}
              onUpdateUserDetails={handleUpdateUserDetails}
              onDeleteUser={handleDeleteUser}
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
              statusFilter={statusFilter}
              onStatusFilterChange={(s) => {
                setStatusFilter(s);
                setCurrentPage(1);
              }}
              roleFilter={roleFilter}
              onRoleFilterChange={(r) => {
                setRoleFilter(r);
                setCurrentPage(1);
              }}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}

          {activeTab === ADMIN_TABS.CARDS && (
            <AdminCardsTab
              cards={cardsData?.cards || []}
              pagination={cardsData?.pagination}
              cardsData={cardsData}
              onFetchCards={fetchCards}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              searchQuery={cardSearchQuery}
              onSearchChange={(q) => {
                setCardSearchQuery(q);
                setCardCurrentPage(1);
              }}
              statusFilter={cardStatusFilter}
              onStatusFilterChange={(s) => {
                setCardStatusFilter(s);
                setCardCurrentPage(1);
              }}
              currentPage={cardCurrentPage}
              onPageChange={setCardCurrentPage}
            />
          )}

          {activeTab === ADMIN_TABS.GUARDRAILS && (
            <AdminGuardrailsTab
              key={config?._id || 'guardrails'}
              config={config}
              onUpdateConfig={handleUpdateConfig}
            />
          )}

          {activeTab === ADMIN_TABS.TOKENS && (
            <AdminTokensTab tokenAnalytics={tokenAnalytics} />
          )}

          {activeTab === ADMIN_TABS.SYSTEM && (
            <AdminSystemTab
              stats={stats}
              incidents={incidents}
              onRefresh={() => Promise.all([fetchOverview(), fetchIncidents()])}
              onRetryFailedJobs={handleRetryFailedJobs}
              onBroadcastNotification={handleBroadcastNotification}
              onResolveIncident={handleResolveIncident}
            />
          )}
        </div>
      </main>
    </div>
  );
}
