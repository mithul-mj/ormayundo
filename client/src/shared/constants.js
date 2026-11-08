// App Routes
export const ROUTES = {
  HOME: '/',
  APP: '/app',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  PRIVACY: '/privacy',
  ADMIN: '/admin',
};

// Dashboard Navigation Tabs
export const APP_TABS = {
  DASHBOARD: 'dashboard',
  MANAGE: 'manage',
  ADMIN: 'admin',
};

// Admin Portal Feature Tabs
export const ADMIN_TABS = {
  OVERVIEW: 'overview',
  USERS: 'users',
  CARDS: 'cards',
  GUARDRAILS: 'guardrails',
  TOKENS: 'tokens',
  SYSTEM: 'system',
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Admin Portal Defaults
export const ADMIN_DEFAULTS = {
  EMAIL_PLACEHOLDER: 'admin@ormayundo.com',
};

// Spaced Repetition Limits & Defaults
export const SPACED_REPETITION = {
  MAX_INTERVAL_DAYS: 365,
  DEFAULT_EASINESS_FACTOR: 2.5,
  MIN_EASINESS_FACTOR: 1.3,
};

// Firebase Web Push Configuration (supports .env override)
export const FIREBASE_CONFIG = {
  apiKey:
    import.meta.env?.VITE_FIREBASE_API_KEY ||
    'AIzaSyDysR_QcERUV1mH0OSjkIKeOo2nm9edobc',
  authDomain:
    import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN ||
    'ormayundo-4f8c5.firebaseapp.com',
  projectId:
    import.meta.env?.VITE_FIREBASE_PROJECT_ID ||
    'ormayundo-4f8c5',
  storageBucket:
    import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET ||
    'ormayundo-4f8c5.firebasestorage.app',
  messagingSenderId:
    import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    '261551023957',
  appId:
    import.meta.env?.VITE_FIREBASE_APP_ID ||
    '1:261551023957:web:5c28db3528f113244d31dc',
  measurementId:
    import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID ||
    'G-1KZ9ST0Q4S',
};

export const VAPID_KEY =
  import.meta.env?.VITE_FIREBASE_VAPID_KEY ||
  'BH-3PZlKBc-8yvnygadCUQitn85ECyWa_iFrniI8YP1KHU1tX3X7kbc8fxw5q12NQiRhWUd2GeuX7M1JJdGgpXg';

// Client Messages
export const MESSAGES = {
  SUCCESS: {
    COPIED: 'Copied',
    TOKEN_SYNCED: 'Web push token synced successfully',
    LOGIN_SUCCESS: 'Logged in successfully',
    ADMIN_LOGIN_SUCCESS: 'Administrator login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
  },
  ERROR: {
    PERMISSION_DENIED: 'Notification permission denied or dismissed.',
    PUSH_UNSUPPORTED: 'Push notifications not supported in this browser.',
    REGISTRATION_FAILED: 'Failed to register web push notifications.',
    ADMIN_CREDENTIALS_REQUIRED: 'Please provide both administrator email and password.',
  },
  ASSETS: {
    EXTENSION_ZIP: 'ormayundo-extension.zip',
    CHROME_EXTENSIONS_URL: 'chrome://extensions',
  },
};
