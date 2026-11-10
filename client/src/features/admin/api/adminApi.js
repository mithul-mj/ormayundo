import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/lib/apiClient';
import { queryKeys } from '../../../shared/lib/queryKeys';

export const adminApi = {
  getStats: async () => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },

  getSystem: async () => {
    const res = await apiClient.get('/admin/system');
    return res.data;
  },

  getTokens: async () => {
    const res = await apiClient.get('/admin/tokens');
    return res.data;
  },

  getConfig: async () => {
    const res = await apiClient.get('/admin/config');
    return res.data;
  },

  getUsers: async (params) => {
    const res = await apiClient.get('/admin/users', { params });
    return res.data;
  },

  getFlashcards: async (params) => {
    const res = await apiClient.get('/admin/flashcards', { params });
    return res.data;
  },

  getIncidents: async () => {
    const res = await apiClient.get('/admin/incidents');
    return res.data;
  },

  updateConfig: async (configData) => {
    const res = await apiClient.put('/admin/config', configData);
    return res.data;
  },

  resetSlotCooldown: async (slotId) => {
    const res = await apiClient.post(`/admin/slots/${slotId}/reset-cooldown`);
    return res.data;
  },

  toggleBlockUser: async ({ id, isBlocked, reason }) => {
    const res = await apiClient.put(`/admin/users/${id}/block`, { isBlocked, reason });
    return res.data;
  },

  revokeSessions: async (id) => {
    const res = await apiClient.post(`/admin/users/${id}/revoke-sessions`);
    return res.data;
  },

  updateUserDetails: async ({ id, data }) => {
    const res = await apiClient.put(`/admin/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await apiClient.delete(`/admin/users/${id}`);
    return res.data;
  },

  updateFlashcard: async ({ id, data }) => {
    const res = await apiClient.put(`/admin/flashcards/${id}`, data);
    return res.data;
  },

  deleteFlashcard: async (id) => {
    const res = await apiClient.delete(`/admin/flashcards/${id}`);
    return res.data;
  },

  resolveIncident: async (id) => {
    const res = await apiClient.put(`/admin/incidents/${id}/resolve`);
    return res.data;
  },

  retryFailedJobs: async () => {
    const res = await apiClient.post('/admin/retry-jobs');
    return res.data;
  },

  broadcastPush: async (payload) => {
    const res = await apiClient.post('/admin/broadcast-push', payload);
    return res.data;
  },
};

// ==========================================
// ADMIN TANSTACK QUERY HOOKS
// ==========================================

export function useAdminOverviewQuery(options = {}) {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: adminApi.getStats,
    ...options,
  });
}

export function useAdminSystemQuery(options = {}) {
  return useQuery({
    queryKey: queryKeys.admin.system(),
    queryFn: adminApi.getSystem,
    ...options,
  });
}

export function useAdminTokensQuery(options = {}) {
  return useQuery({
    queryKey: queryKeys.admin.tokens(),
    queryFn: adminApi.getTokens,
    ...options,
  });
}

export function useAdminConfigQuery(options = {}) {
  return useQuery({
    queryKey: queryKeys.admin.config(),
    queryFn: adminApi.getConfig,
    ...options,
  });
}

export function useAdminUsersQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminApi.getUsers(params),
    ...options,
  });
}

export function useAdminCardsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.admin.cards(params),
    queryFn: () => adminApi.getFlashcards(params),
    ...options,
  });
}

export function useAdminIncidentsQuery(options = {}) {
  return useQuery({
    queryKey: queryKeys.admin.incidents(),
    queryFn: adminApi.getIncidents,
    ...options,
  });
}

export function useUpdateConfigMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateConfig,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.config() });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
}

export function useResetSlotCooldownMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.resetSlotCooldown,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.config() });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
}

