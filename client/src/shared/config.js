// Configuration for the Client Website

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocalhost
  ? 'http://localhost:5000'
  : 'https://ormayundo-i2h9.onrender.com';

export const API_URL = `${API_BASE_URL}/api`;

