import axios from 'axios';
import { API_URL } from '../config';
import { queryClient } from './queryClient';
import { queryKeys } from './queryKeys';

/**
 * Standardized HTTP client instance with credentials and base configuration.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mutex & queue state for handling concurrent requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

/**
 * Cleanly evict authenticated session state across React Query and trigger navigation
 */
export const handleSessionEviction = (message = 'Session expired. Please log in again.') => {
  // Clear cached user and invalid server state
  queryClient.setQueryData(queryKeys.auth.me(), null);
  queryClient.clear();

  // Redirect to login if user is currently on a protected route
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const isProtectedRoute = pathname.startsWith('/app') || pathname.startsWith('/dashboard');

    if (isProtectedRoute) {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }

    // Broadcast event for UI cleanup (e.g. closing modals/study sessions)
    window.dispatchEvent(
      new CustomEvent('auth:unauthorized', {
        detail: { message, status: 401 },
      })
    );
  }
};

// 1. Request Interceptor: Automatically attach user client timezone
apiClient.interceptors.request.use(
  (config) => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTimezone && !config.headers['x-timezone']) {
        config.headers['x-timezone'] = userTimezone;
      }
    } catch {
      // Fallback silently if Intl is not available
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Standardize errors + Silent Token Refresh with Mutex Queue
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // If response is not 401 or request was already retried, standardize error and reject
    if (status !== 401 || !originalRequest || originalRequest._retry) {
      const customMessage =
        error.response?.data?.message || error.message || 'An unexpected error occurred';
      error.extractedMessage = customMessage;
      return Promise.reject(error);
    }

    // Initial guest check on /auth/me when unauthenticated should reject gracefully without kicking
    const hasCachedSession = Boolean(queryClient.getQueryData(queryKeys.auth.me()));
    if (url.includes('/auth/me') && !hasCachedSession) {
      return Promise.reject(error);
    }

    // Auth endpoints (refresh, login) that fail with 401 indicate unrecoverable session failure
    if (
      url.includes('/auth/refresh') ||
      url.includes('/auth/google') ||
      url.includes('/admin/login')
    ) {
      handleSessionEviction();
      return Promise.reject(error);
    }

    // Mark original request as retried to avoid infinite loops
    originalRequest._retry = true;

    // If another request is currently refreshing the token, enqueue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      // Attempt silent token refresh via HTTP-only refresh cookie
      await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      // Successfully rotated token: process all queued requests and retry the original
      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh token is expired, invalid, or revoked -> evict user
      processQueue(refreshError);
      handleSessionEviction();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);



