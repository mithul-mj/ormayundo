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
} from 'lucide-react';
import { API_URL } from '../../shared/config';
import AdminOverviewTab from './AdminOverviewTab';
import AdminUsersTab from './AdminUsersTab';
import AdminCardsTab from './AdminCardsTab';
import AdminTokensTab from './AdminTokensTab';
import AdminGuardrailsTab from './AdminGuardrailsTab';
import AdminSystemTab from './AdminSystemTab';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
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
  const [currentPage, setCurrentPage] = useState(1);

  // Flashcards query states
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [cardStatusFilter, setCardStatusFilter] = useState('all');
  const [cardCurrentPage, setCardCurrentPage] = useState(1);

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
        limit: '15',
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
        limit: '15',
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

  // Initial load on mount
  useEffect(() => {
    let ignore = false;

    async function init() {
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
          setError(
            err.response?.data?.message || 'Access denied or failed to load administrative data.'
          );
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, []);

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

  if (loading && !stats) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand animate-spin mb-3" />
        <span className="text-xs font-semibold text-muted">
          Loading Administrator Portal & Guardrails...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-ink mb-2">Administrator Access Required</h2>
        <p className="text-xs text-muted mb-6">{error}</p>
        <button
          onClick={loadAllData}
          className="px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-hover transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Admin Portal Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-divider">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-extrabold tracking-wide uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </span>
            <span className="text-xs text-muted font-medium">• Ormayundo Cloud Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Platform Guardrails & Management
          </h1>
          <p className="text-xs text-muted mt-1">
            Live configuration for AI models, rate limits, user moderation, and global flashcard records.
          </p>
        </div>

        {/* Global Refresh Button */}
        <button
          onClick={loadAllData}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-surface border border-divider text-ink font-bold text-xs transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className={['w-3.5 h-3.5 text-muted', loading ? 'animate-spin' : ''].join(' ')} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Feature Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-divider pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0',
            activeTab === 'overview'
              ? 'bg-ink text-white shadow-xs'
              : 'text-muted hover:text-ink hover:bg-surface',
          ].join(' ')}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0',
            activeTab === 'users'
              ? 'bg-ink text-white shadow-xs'
              : 'text-muted hover:text-ink hover:bg-surface',
          ].join(' ')}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users</span>
          {stats?.users?.total !== undefined && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-surface text-ink text-[10px] font-bold">
              {stats.users.total}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0',
            activeTab === 'cards'
              ? 'bg-ink text-white shadow-xs'
              : 'text-muted hover:text-ink hover:bg-surface',
          ].join(' ')}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Flashcards Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('guardrails')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0',
            activeTab === 'guardrails'
              ? 'bg-brand text-white shadow-xs'
              : 'text-muted hover:text-ink hover:bg-surface',
          ].join(' ')}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Guardrails & Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('tokens')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0',
            activeTab === 'tokens'
              ? 'bg-ink text-white shadow-xs'
              : 'text-muted hover:text-ink hover:bg-surface',
          ].join(' ')}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Token Usage</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0',
            activeTab === 'system'
              ? 'bg-ink text-white shadow-xs'
              : 'text-muted hover:text-ink hover:bg-surface',
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

      {/* Active Tab View */}
      <div>
        {activeTab === 'overview' && (
          <AdminOverviewTab stats={stats} tokenAnalytics={tokenAnalytics} />
        )}

        {activeTab === 'users' && (
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

        {activeTab === 'cards' && (
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

        {activeTab === 'guardrails' && (
          <AdminGuardrailsTab
            key={config?._id || 'guardrails'}
            config={config}
            onUpdateConfig={handleUpdateConfig}
          />
        )}

        {activeTab === 'tokens' && (
          <AdminTokensTab tokenAnalytics={tokenAnalytics} />
        )}

        {activeTab === 'system' && (
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
    </div>
  );
}
