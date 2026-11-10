import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes data freshness by default
      gcTime: 1000 * 60 * 15, // 15 minutes cache retention
      retry: 1, // Only retry once on failure to avoid request cascading
      refetchOnWindowFocus: false, // Prevent distracting unexpected refetches
      refetchOnReconnect: false, // Prevent request flood on reconnect
      refetchOnMount: false, // Use fresh cached data on component remount; no duplicate calls
    },
  },
});

