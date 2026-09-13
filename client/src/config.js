// Configuration for the Client Website

export const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://ormayundo-i2h9.onrender.com';

export const API_URL = `${API_BASE_URL}/api`;
