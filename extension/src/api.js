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
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // Clear local user data when refresh token fails
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.remove(['ormayundo_user']);
          chrome.runtime.sendMessage({ action: 'USER_LOGOUT' });
        } else {
          localStorage.removeItem('ormayundo_user');
        }
        refreshError.isAuthError = true;
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      error.isAuthError = true;
    }

    return Promise.reject(error);
  }
);

export default api;
