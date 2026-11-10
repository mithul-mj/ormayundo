import axios from 'axios';
import { API_URL } from '../config';

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message extraction
    const customMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    error.extractedMessage = customMessage;
    return Promise.reject(error);
  }
);

