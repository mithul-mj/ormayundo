import { useState, useEffect, useCallback } from 'react';
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
  const [systemHealth, setSystemHealth] = useState(null);
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

  // Fetch overview stats and system health
  const fetchOverview = useCallback(async () => {
    try {
      const [statsRes, healthRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { withCredentials: true }),
        axios.get(`${API_URL}/admin/system`, { withCredentials: true }),
      ]);
      setStats(statsRes.data);
      setSystemHealth(healthRes.data);
    } catch (err) {
      console.error('Failed to load overview data:', err);
    }
  }, []);

  // Fetch token usage analytics
  const fetchTokens = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/tokens`, { withCredentials: true });
      setTokenAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load token analytics:', err);
    }
  }, []);

  // Fetch platform guardrails & configuration
  const fetchConfig = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/config`, { withCredentials: true });
      setConfig(res.data);
    } catch (err) {
      console.error('Failed to load system config:', err);
    }
  }, []);

  // Fetch paginated user list
  const fetchUsers = useCallback(async () => {
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
    }
  }, [currentPage, statusFilter, roleFilter, searchQuery]);

  // Fetch global flashcards
  const fetchCards = useCallback(async () => {
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
    }
  }, [cardCurrentPage, cardStatusFilter, cardSearchQuery]);

  // Fetch failure incidents and alerts
  const fetchIncidents = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/incidents`, { withCredentials: true });
      setIncidents(res.data);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    }
  }, []);

  // Global reload helper for refresh button
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchOverview(),
        fetchTokens(),
        fetchConfig(),
        fetchUsers(),
        fetchCards(),
        fetchIncidents(),
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Access denied or failed to load administrative data.'
      );
    } finally {
      setLoading(false);
    }
  }, [fetchOverview, fetchTokens, fetchConfig, fetchUsers, fetchCards, fetchIncidents]);

  // Verify administrator session if initialUser is missing or not admin
  useEffect(() => {
    let ignore = false;
    async function checkAdminAuth() {
      if (initialUser && initialUser.role === USER_ROLES.ADMIN) {
        setCurrentUser(initialUser);
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

  // Initial load on mount or when currentUser becomes an admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) {
      return;
    }
    let ignore = false;

    async function init() {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, healthRes, tokensRes, configRes, usersRes, cardsRes, incidentsRes] =
          await Promise.all([
            axios.get(`${API_URL}/admin/stats`, { withCredentials: true }),
            axios.get(`${API_URL}/admin/system`, { withCredentials: true }),
            axios.get(`${API_URL}/admin/tokens`, { withCredentials: true }),
            axios.get(`${API_URL}/admin/config`, { withCredentials: true }),
            axios.get(`${API_URL}/admin/users?page=1&limit=15&status=all&role=all`, {
              withCredentials: true,
            }),
            axios.get(`${API_URL}/admin/flashcards?page=1&limit=15&status=all`, {
              withCredentials: true,
            }),
            axios.get(`${API_URL}/admin/incidents`, { withCredentials: true }),
          ]);

        if (!ignore) {
          setStats(statsRes.data);
          setSystemHealth(healthRes.data);
          setTokenAnalytics(tokensRes.data);
          setConfig(configRes.data);
          setUsersData(usersRes.data);
          setCardsData(cardsRes.data);
          setIncidents(incidentsRes.data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            setCurrentUser(null);
          } else {
            setError(
              err.response?.data?.message || 'Access denied or failed to load administrative data.'
            );
          }
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, [currentUser]);

  // Update user list when filters change
  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '15',
      status: statusFilter,
      role: roleFilter,
    });
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    axios
      .get(`${API_URL}/admin/users?${params.toString()}`, { withCredentials: true })
      .then((res) => {
        if (!ignore) setUsersData(res.data);
      })
      .catch((err) => {
        console.error('Failed to update users table:', err);
      });

    return () => {
      ignore = true;
    };
  }, [currentPage, statusFilter, roleFilter, searchQuery]);

  // Update cards list when filters change
  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({
      page: cardCurrentPage.toString(),
      limit: '15',
      status: cardStatusFilter,
    });
    if (cardSearchQuery.trim()) {
      params.append('search', cardSearchQuery.trim());
    }

    axios
      .get(`${API_URL}/admin/flashcards?${params.toString()}`, { withCredentials: true })
      .then((res) => {
        if (!ignore) setCardsData(res.data);
      })
      .catch((err) => {
        console.error('Failed to update cards table:', err);
      });

    return () => {
      ignore = true;
    };
  }, [cardCurrentPage, cardStatusFilter, cardSearchQuery]);

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
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand animate-spin mb-3" />
        <span className="text-xs font-semibold text-muted">
          Loading Administrator Portal & Guardrails...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-divider shadow-md text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-6 h-6" />
          </div>
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
    <div className="min-h-screen bg-surface text-ink flex flex-col font-sans">
      {/* Airbnb Style Sticky Navigation Header */}
      <header className="bg-white border-b border-divider sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={onNavigateHome}
              title="Return to Landing Page"
            >
              <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center text-white shadow-sm shadow-brand/25 group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-brand">
                Ormayundo.
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand text-[11px] font-extrabold uppercase tracking-wide">
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Hub</span>
            </span>
          </div>

          {/* Center: System Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-divider text-xs font-semibold text-ink">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Systems Normal</span>
            {stats?.incidents?.unresolved > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {stats.incidents.unresolved} incident{stats.incidents.unresolved > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-surface border border-divider text-ink font-bold text-xs transition-all shadow-xs cursor-pointer hover:border-ink/20"
              title="Refresh all metrics"
            >
              <RefreshCw className={['w-3.5 h-3.5 text-muted', loading ? 'animate-spin text-brand' : ''].join(' ')} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-surface border border-divider text-ink font-bold text-xs transition-all shadow-xs cursor-pointer hover:border-ink/20"
                title="Return to Student Application"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-muted" />
                <span>Student App</span>
              </button>
            )}

            {/* Admin identity chip */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-divider">
              <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-ink max-w-[120px] truncate">
                {currentUser?.email}
              </span>
            </div>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 font-bold text-xs transition-colors cursor-pointer"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* Title & Category Bar */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Platform Controls & Governance
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-2xl">
              Monitor real-time Groq AI generation queues, configure model guardrails, manage user quotas, and maintain global flashcards.
            </p>
          </div>

          {/* Airbnb Category Pill Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none border-b border-divider/60">
            <button
              onClick={() => setActiveTab(ADMIN_TABS.OVERVIEW)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer shrink-0 border',
                activeTab === ADMIN_TABS.OVERVIEW
                  ? 'bg-ink text-white border-ink shadow-sm'
                  : 'bg-white text-muted border-divider hover:text-ink hover:border-ink/30 hover:bg-surface',
              ].join(' ')}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab(ADMIN_TABS.USERS)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer shrink-0 border',
                activeTab === ADMIN_TABS.USERS
                  ? 'bg-ink text-white border-ink shadow-sm'
                  : 'bg-white text-muted border-divider hover:text-ink hover:border-ink/30 hover:bg-surface',
              ].join(' ')}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users & Quotas</span>
              {stats?.users?.total !== undefined && (
                <span className={['ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold', activeTab === ADMIN_TABS.USERS ? 'bg-white/20 text-white' : 'bg-surface text-ink'].join(' ')}>
                  {stats.users.total}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab(ADMIN_TABS.CARDS)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer shrink-0 border',
                activeTab === ADMIN_TABS.CARDS
                  ? 'bg-ink text-white border-ink shadow-sm'
                  : 'bg-white text-muted border-divider hover:text-ink hover:border-ink/30 hover:bg-surface',
              ].join(' ')}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Flashcard Records</span>
            </button>

            <button
              onClick={() => setActiveTab(ADMIN_TABS.GUARDRAILS)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer shrink-0 border',
                activeTab === ADMIN_TABS.GUARDRAILS
                  ? 'bg-brand text-white border-brand shadow-sm shadow-brand/20'
                  : 'bg-white text-muted border-divider hover:text-ink hover:border-brand/40 hover:bg-surface',
              ].join(' ')}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Guardrails & Engine</span>
            </button>

            <button
              onClick={() => setActiveTab(ADMIN_TABS.TOKENS)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer shrink-0 border',
                activeTab === ADMIN_TABS.TOKENS
                  ? 'bg-ink text-white border-ink shadow-sm'
                  : 'bg-white text-muted border-divider hover:text-ink hover:border-ink/30 hover:bg-surface',
              ].join(' ')}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Token Accounting</span>
            </button>

            <button
              onClick={() => setActiveTab(ADMIN_TABS.SYSTEM)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer shrink-0 border',
                activeTab === ADMIN_TABS.SYSTEM
                  ? 'bg-ink text-white border-ink shadow-sm'
                  : 'bg-white text-muted border-divider hover:text-ink hover:border-ink/30 hover:bg-surface',
              ].join(' ')}
            >
              <Server className="w-3.5 h-3.5" />
              <span>System & Queue</span>
              {stats?.incidents?.unresolved > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                  {stats.incidents.unresolved}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Views */}
        <div className="pt-2">
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
              systemHealth={systemHealth}
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
