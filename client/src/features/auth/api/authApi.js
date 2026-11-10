import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/lib/apiClient';
import { queryKeys } from '../../../shared/lib/queryKeys';

export const authApi = {
  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
};

export function useCurrentUserQuery(options = {}) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.getCurrentUser,
    retry: false, // Don't retry auth checks on 401
    staleTime: 1000 * 60 * 5, // 5 minutes session freshness
    ...options,
  });
}

export function useLogoutMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: (data, variables, context) => {
      queryClient.clear(); // Wipe all cached user data on logout
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
}

