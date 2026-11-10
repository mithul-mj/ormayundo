import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/lib/apiClient';
import { queryKeys } from '../../../shared/lib/queryKeys';

export const analyticsApi = {
  getAnalytics: async () => {
    const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
    const res = await apiClient.get(`/analytics?timezone=${encodeURIComponent(timezone)}`, {
      headers: { 'x-timezone': timezone }
    });
    return res.data;
  },
};

export function useAnalyticsQuery() {
  return useQuery({
    queryKey: queryKeys.analytics.all,
    queryFn: analyticsApi.getAnalytics,
  });
}

