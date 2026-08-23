import axios from 'axios';
import { API_URL } from './config';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Intercept responses to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to hit the refresh endpoint
        // This endpoint will receive the refreshToken because its path matches /api/auth/refresh
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        
        // If successful, the new accessToken is in our cookies now. Retry the original request!
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is also expired or missing. User must log in again.
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
